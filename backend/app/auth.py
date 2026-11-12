import hashlib,secrets
from datetime import datetime,timedelta,timezone
from urllib.parse import urlencode
from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter,Depends,HTTPException,Request
from fastapi.responses import RedirectResponse
from jose import jwt
from sqlalchemy.orm import Session
from app.core import settings
from app.database import get_db
from app.models import User,LoginTicket
cfg=settings();router=APIRouter(prefix="/auth",tags=["Autenticação"]);oauth=OAuth()
if cfg.codeforces_client_id and cfg.codeforces_client_secret:
 oauth.register(name="cf",server_metadata_url=cfg.codeforces_discovery_url,client_id=cfg.codeforces_client_id,client_secret=cfg.codeforces_client_secret,client_kwargs={"scope":"openid"})
@router.get("/codeforces/login")
async def login(request:Request):
 if not cfg.codeforces_client_id or not cfg.codeforces_client_secret:raise HTTPException(503,"Configure as credenciais OIDC do Codeforces no backend.")
 return await oauth.cf.authorize_redirect(request,cfg.codeforces_callback_url)
@router.get("/codeforces/callback")
async def callback(request:Request,db:Session=Depends(get_db)):
 try:
  token=await oauth.cf.authorize_access_token(request);claims=token.get("userinfo") or {}
  handle=claims.get("handle") or claims.get("preferred_username")
  if not handle:raise HTTPException(401,"Identidade Codeforces sem handle.")
  user=db.query(User).filter_by(codeforces_handle=handle).first()
  if not user:user=User(codeforces_handle=handle);db.add(user)
  user.display_name=claims.get("name") or handle;user.avatar_url=claims.get("picture");user.rating=claims.get("rating")
  db.commit();db.refresh(user)
  raw=secrets.token_urlsafe(32);db.add(LoginTicket(id=hashlib.sha256(raw.encode()).hexdigest(),user_id=user.id,expires_at=datetime.now(timezone.utc)+timedelta(minutes=2)));db.commit()
  return RedirectResponse(cfg.mobile_redirect_uri+"?"+urlencode({"ticket":raw}))
 except HTTPException:raise
 except Exception:raise HTTPException(401,"Falha na autenticação OpenID Connect do Codeforces.")
@router.post("/codeforces/exchange")
def exchange(payload:dict,db:Session=Depends(get_db)):
 raw=payload.get("ticket","");ticket=db.get(LoginTicket,hashlib.sha256(raw.encode()).hexdigest());now=datetime.now(timezone.utc)
 if not ticket or ticket.consumed_at or ticket.expires_at.replace(tzinfo=timezone.utc)<now:raise HTTPException(401,"Ticket inválido, expirado ou já utilizado.")
 ticket.consumed_at=now;user=db.get(User,ticket.user_id);db.commit()
 if not user:raise HTTPException(401,"Usuário não encontrado.")
 exp=now+timedelta(minutes=cfg.jwt_expire_minutes);token=jwt.encode({"sub":user.id,"exp":exp},cfg.jwt_secret,algorithm="HS256")
 return {"access_token":token,"token_type":"bearer","user":{"id":user.id,"codeforces_handle":user.codeforces_handle,"display_name":user.display_name,"avatar_url":user.avatar_url,"rating":user.rating}}
