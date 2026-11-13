import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from jose import jwt
from sqlalchemy.orm import Session

from app.core import settings
from app.database import get_db
from app.models import User, LoginTicket

cfg = settings()
router = APIRouter(prefix="/auth", tags=["Autenticação"])
oauth = OAuth()

if cfg.codeforces_client_id and cfg.codeforces_client_secret:
    oauth.register(
        name="cf",
        server_metadata_url=cfg.codeforces_discovery_url,
        client_id=cfg.codeforces_client_id,
        client_secret=cfg.codeforces_client_secret,
        client_kwargs={"scope": "openid"},
    )


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return "scrypt$" + salt.hex() + "$" + digest.hex()


def _verify_password(password: str, encoded: str | None) -> bool:
    if not encoded:
        return False
    try:
        algorithm, salt_hex, digest_hex = encoded.split("$", 2)
        if algorithm != "scrypt":
            return False
        digest = hashlib.scrypt(
            password.encode("utf-8"), salt=bytes.fromhex(salt_hex),
            n=2**14, r=8, p=1,
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _user_payload(user: User):
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "codeforces_handle": user.codeforces_handle,
        "avatar_url": user.avatar_url,
        "rating": user.rating,
    }


def _issue_token(user: User):
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {"sub": user.id, "exp": now + timedelta(minutes=cfg.jwt_expire_minutes)},
        cfg.jwt_secret,
        algorithm="HS256",
    )
    return {"access_token": token, "token_type": "bearer", "user": _user_payload(user)}


@router.post("/register")
def register(payload: dict, db: Session = Depends(get_db)):
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    if len(name) < 3:
        raise HTTPException(422, "Informe um nome com pelo menos 3 caracteres.")
    if len(email) > 254 or "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(422, "Informe um e-mail válido.")
    if len(password) < 8:
        raise HTTPException(422, "A senha precisa ter pelo menos 8 caracteres.")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "Este e-mail já está cadastrado.")
    user = User(display_name=name, email=email, password_hash=_hash_password(password))
    db.add(user)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(409, "Não foi possível cadastrar. Verifique se o e-mail já existe.")
    db.refresh(user)
    return _issue_token(user)


@router.post("/login")
def email_login(payload: dict, db: Session = Depends(get_db)):
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    user = db.query(User).filter(User.email == email).first()
    if not user or not _verify_password(password, user.password_hash):
        raise HTTPException(401, "E-mail ou senha inválidos.")
    return _issue_token(user)


@router.get("/codeforces/login")
async def codeforces_login(request: Request):
    if not cfg.codeforces_client_id or not cfg.codeforces_client_secret:
        raise HTTPException(503, "Configure as credenciais OIDC do Codeforces no backend.")
    return await oauth.cf.authorize_redirect(request, cfg.codeforces_callback_url)


@router.get("/codeforces/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.cf.authorize_access_token(request)
        claims = token.get("userinfo") or {}
        handle = claims.get("handle") or claims.get("preferred_username")
        if not handle:
            raise HTTPException(401, "Identidade Codeforces sem handle.")
        user = db.query(User).filter_by(codeforces_handle=handle).first()
        if not user:
            user = User(codeforces_handle=handle, display_name=handle)
            db.add(user)
        user.display_name = claims.get("name") or handle
        user.avatar_url = claims.get("picture")
        user.rating = claims.get("rating")
        db.commit()
        db.refresh(user)
        raw = secrets.token_urlsafe(32)
        db.add(LoginTicket(
            id=hashlib.sha256(raw.encode()).hexdigest(),
            user_id=user.id,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=2),
        ))
        db.commit()
        return RedirectResponse(cfg.mobile_redirect_uri + "?" + urlencode({"ticket": raw}))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(401, "Falha na autenticação OpenID Connect do Codeforces.")


@router.post("/codeforces/exchange")
def exchange(payload: dict, db: Session = Depends(get_db)):
    raw = payload.get("ticket", "")
    ticket = db.get(LoginTicket, hashlib.sha256(raw.encode()).hexdigest())
    now = datetime.now(timezone.utc)
    if not ticket or ticket.consumed_at or ticket.expires_at.replace(tzinfo=timezone.utc) < now:
        raise HTTPException(401, "Ticket inválido, expirado ou já utilizado.")
    ticket.consumed_at = now
    user = db.get(User, ticket.user_id)
    db.commit()
    if not user:
        raise HTTPException(401, "Usuário não encontrado.")
    return _issue_token(user)
