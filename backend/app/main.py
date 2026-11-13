import asyncio

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from sqlalchemy import text
import uuid

from app.core import settings
from app.database import Base, engine, get_db
from app.models import User, TrainingSession, TrainingSubmission
from app import codeforces
from app.auth import router as auth_router

cfg = settings()
Base.metadata.create_all(bind=engine)
# Atualiza bancos existentes; create_all não altera tabelas já criadas.
with engine.begin() as connection:
    connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(254)"))
    connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(256)"))
    connection.execute(text("ALTER TABLE users ALTER COLUMN codeforces_handle DROP NOT NULL"))
    connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)"))

app = FastAPI(title="RankFlow API", version="0.6.0")
app.add_middleware(
    SessionMiddleware,
    secret_key=cfg.session_secret,
    https_only=cfg.app_env == "production",
    same_site="lax",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/api")

bearer = HTTPBearer()


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    try:
        user_id = jwt.decode(
            credentials.credentials,
            cfg.jwt_secret,
            algorithms=["HS256"],
        ).get("sub")
    except JWTError:
        raise HTTPException(401, "Sessão inválida.")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(401, "Usuário não encontrado.")
    return user


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/users/me")
def me(user: User = Depends(current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "codeforces_handle": user.codeforces_handle,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "rating": user.rating,
    }


@app.get("/api/codeforces/users/{handle}")
async def user_info(handle: str):
    return await codeforces.info(handle)


@app.get("/api/codeforces/users/{handle}/rating")
async def user_rating(handle: str):
    return await codeforces.rating(handle)


@app.get("/api/codeforces/users/{handle}/submissions")
async def user_status(
    handle: str,
    count: int = Query(1000, ge=1, le=1000),
):
    return await codeforces.status(handle, count)


@app.get("/api/codeforces/users/{handle}/summary")
async def user_summary(handle: str):
    user, rating_history, solved = await asyncio.gather(
        codeforces.info(handle),
        codeforces.rating(handle),
        codeforces.solved_summary(handle),
    )
    return {
        "user": user,
        "ratingHistory": rating_history,
        **solved,
        "contestCount": len(rating_history),
        "ratingGainLastFive": sum(
            item["newRating"] - item["oldRating"]
            for item in rating_history[-5:]
        ),
        "recentRating": [
            item["newRating"] for item in rating_history[-7:]
        ],
    }


@app.get("/api/codeforces/problem-tags")
async def codeforces_problem_tags():
    return {"tags": await codeforces.problem_tags()}


@app.get("/api/codeforces/problems")
async def codeforces_problems(
    tags: str | None = None,
    min_rating: int | None = Query(None, ge=800, le=4000),
    max_rating: int | None = Query(None, ge=800, le=4000),
    limit: int = Query(100, ge=1, le=500),
):
    data = await codeforces.problems(tags)
    items = data.get("problems", [])
    if min_rating is not None:
        items = [
            problem for problem in items
            if problem.get("rating") is not None
            and problem["rating"] >= min_rating
        ]
    if max_rating is not None:
        items = [
            problem for problem in items
            if problem.get("rating") is not None
            and problem["rating"] <= max_rating
        ]
    return {"problems": items[:limit], "total": len(items)}


@app.get("/api/codeforces/users/{handle}/solved")
async def codeforces_solved(handle: str):
    return await codeforces.solved_summary(handle)


@app.get("/api/codeforces/users/{handle}/training")
async def codeforces_training(
    handle: str,
    quantity: int = Query(5, ge=3, le=6),
    min_rating: int = Query(800, ge=800, le=4000),
    max_rating: int = Query(1500, ge=800, le=4000),
    tags: str | None = None,
):
    selected_tags = [tag.strip() for tag in (tags or "").split(",") if tag.strip()]
    return await codeforces.generate_training(
        handle,
        quantity,
        min_rating,
        max_rating,
        selected_tags,
    )


@app.get("/api/codeforces/users/{handle}/verification-problem")
async def codeforces_verification_problem(handle: str):
    return await codeforces.generate_training(handle, 1, 800, 1200, [])



def _session_payload(session: TrainingSession, db: Session):
    now = datetime.now(timezone.utc)
    ends_at = session.ends_at if session.ends_at.tzinfo else session.ends_at.replace(tzinfo=timezone.utc)
    started_at = session.started_at if session.started_at.tzinfo else session.started_at.replace(tzinfo=timezone.utc)
    if now < started_at:
        status = "scheduled"
    elif now >= ends_at:
        status = "finished"
    else:
        status = "active"
    if status != session.status:
        session.status = status
        db.commit()
    submissions = db.query(TrainingSubmission).filter_by(session_id=session.id).order_by(TrainingSubmission.submitted_at.asc()).all()
    return {
        "id": session.id,
        "title": session.title,
        "creatorHandle": session.creator_handle,
        "participants": session.participants,
        "problems": session.problems,
        "durationMinutes": session.duration_minutes,
        "startedAt": started_at.isoformat(),
        "endsAt": ends_at.isoformat(),
        "status": status,
        "serverNow": now.isoformat(),
        "submissions": [{
            "id": item.id,
            "participant": item.participant,
            "problemId": item.problem_id,
            "verdict": item.verdict,
            "points": item.points,
            "submittedAt": item.submitted_at.isoformat() if item.submitted_at else None,
        } for item in submissions],
    }


@app.post("/api/trainings")
def create_training_session(payload: dict, db: Session = Depends(get_db)):
    creator = str(payload.get("creatorHandle", "")).strip()
    participants = list(dict.fromkeys(str(x).strip() for x in payload.get("participants", []) if str(x).strip()))
    problems = payload.get("problems", [])
    duration = payload.get("durationMinutes", 60)
    if not creator or creator not in participants:
        raise HTTPException(422, "O criador precisa estar entre os participantes.")
    if not isinstance(problems, list) or not problems:
        raise HTTPException(422, "O treino precisa ter problemas.")
    if len(participants) > 30 or len(problems) > 20:
        raise HTTPException(422, "Limite de participantes ou problemas excedido.")
    if not isinstance(duration, int) or not 5 <= duration <= 360:
        raise HTTPException(422, "A duração deve estar entre 5 e 360 minutos.")
    now = datetime.now(timezone.utc)
    raw_start = payload.get("startAt")
    if raw_start:
        try:
            starts_at = datetime.fromisoformat(str(raw_start).replace("Z", "+00:00"))
            if starts_at.tzinfo is None:
                starts_at = starts_at.replace(tzinfo=timezone.utc)
            starts_at = starts_at.astimezone(timezone.utc)
        except ValueError:
            raise HTTPException(422, "Data e horário de início inválidos.")
    else:
        starts_at = now
    if starts_at < now - timedelta(minutes=1):
        raise HTTPException(422, "O início do treino não pode estar no passado.")
    if starts_at > now + timedelta(days=90):
        raise HTTPException(422, "O treino só pode ser agendado para os próximos 90 dias.")
    session = TrainingSession(
        id=str(uuid.uuid4()),
        title=str(payload.get("title") or "Treino RankFlow")[:160],
        creator_handle=creator,
        participants=participants,
        problems=problems,
        duration_minutes=duration,
        started_at=starts_at,
        ends_at=starts_at + timedelta(minutes=duration),
        status="scheduled" if starts_at > now else "active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return _session_payload(session, db)


@app.get("/api/trainings/{session_id}")
def get_training_session(session_id: str, db: Session = Depends(get_db)):
    session = db.get(TrainingSession, session_id)
    if not session:
        raise HTTPException(404, "Treino não encontrado.")
    return _session_payload(session, db)


@app.post("/api/trainings/{session_id}/submissions")
def submit_training_attempt(session_id: str, payload: dict, db: Session = Depends(get_db)):
    session = db.get(TrainingSession, session_id)
    if not session:
        raise HTTPException(404, "Treino não encontrado.")
    now = datetime.now(timezone.utc)
    ends_at = session.ends_at if session.ends_at.tzinfo else session.ends_at.replace(tzinfo=timezone.utc)
    started_at = session.started_at if session.started_at.tzinfo else session.started_at.replace(tzinfo=timezone.utc)
    if now < started_at:
        raise HTTPException(409, "Este treino ainda não começou.")
    if session.status == "finished" or now >= ends_at:
        session.status = "finished"
        db.commit()
        raise HTTPException(409, "O tempo deste treino terminou.")
    participant = str(payload.get("participant", "")).strip()
    problem_id = str(payload.get("problemId", "")).strip()
    verdict = str(payload.get("verdict", "")).upper()
    if participant not in session.participants:
        raise HTTPException(403, "Participante não faz parte deste treino.")
    problem = next((p for p in session.problems if str(p.get("id")) == problem_id), None)
    if not problem:
        raise HTTPException(404, "Problema não pertence a este treino.")
    if verdict not in {"OK", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR"}:
        raise HTTPException(422, "Resultado de simulação inválido.")
    already_solved = db.query(TrainingSubmission).filter_by(
        session_id=session.id, participant=participant, problem_id=problem_id, verdict="OK"
    ).first()
    if already_solved:
        raise HTTPException(409, "Este participante já pontuou neste problema.")
    points = (100 + int(problem.get("rating") or 0) // 10) if verdict == "OK" else 0
    submission = TrainingSubmission(
        id=str(uuid.uuid4()), session_id=session.id, participant=participant,
        problem_id=problem_id, verdict=verdict, points=points, submitted_at=now,
    )
    db.add(submission)
    db.commit()
    return _session_payload(session, db)


@app.get("/api/trainings/{session_id}/scoreboard")
def training_scoreboard(session_id: str, db: Session = Depends(get_db)):
    session = db.get(TrainingSession, session_id)
    if not session:
        raise HTTPException(404, "Treino não encontrado.")
    payload = _session_payload(session, db)
    rows = []
    for handle in session.participants:
        attempts = [s for s in payload["submissions"] if s["participant"] == handle]
        solved = {s["problemId"] for s in attempts if s["verdict"] == "OK"}
        rows.append({
            "participant": handle,
            "solved": len(solved),
            "points": sum(s["points"] for s in attempts),
            "attempts": len(attempts),
            "lastSubmissionAt": attempts[-1]["submittedAt"] if attempts else None,
        })
    rows.sort(key=lambda row: (-row["points"], -row["solved"], row["attempts"]))
    return {**payload, "ranking": rows}
