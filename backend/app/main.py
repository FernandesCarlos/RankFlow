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
from app.models import User, TrainingSession
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
    refresh: bool = Query(False),
):
    return await codeforces.status(handle, count, refresh=refresh)


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

@app.get("/api/codeforces/problems/search")
async def search_codeforces_problems(q: str = Query(..., min_length=1, max_length=120)):
    term = q.strip().lower()
    data = await codeforces.problems()
    matches = []
    for problem in data.get("problems", []):
        contest_id = problem.get("contestId")
        index = problem.get("index")
        if contest_id is None or not index:
            continue
        problem_id = f"{contest_id}-{index}"
        title = str(problem.get("name") or "")
        if term in title.lower() or term == problem_id.lower() or term == f"{contest_id}{index}".lower():
            tags = problem.get("tags") or []
            matches.append({
                "id": problem_id,
                "contestId": contest_id,
                "index": index,
                "title": title,
                "rating": problem.get("rating") or 0,
                "tags": tags,
                "tag": tags[0] if tags else "sem tag",
                "url": f"https://codeforces.com/problemset/problem/{contest_id}/{index}",
            })
        if len(matches) >= 30:
            break
    return {"problems": matches, "total": len(matches)}


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
        "submissions": [],
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


@app.get("/api/trainings/{session_id}/scoreboard")
async def training_scoreboard(session_id: str, db: Session = Depends(get_db)):
    session = db.get(TrainingSession, session_id)
    if not session:
        raise HTTPException(404, "Treino não encontrado.")

    payload = _session_payload(session, db)
    start_at = session.started_at
    if start_at.tzinfo is None:
        start_at = start_at.replace(tzinfo=timezone.utc)
    end_at = session.ends_at
    if end_at.tzinfo is None:
        end_at = end_at.replace(tzinfo=timezone.utc)

    problem_by_id = {str(problem.get("id")): problem for problem in session.problems}
    all_attempts = []

    # O placar usa exclusivamente submissões públicas reais do Codeforces.
    for handle in session.participants:
        try:
            remote = await codeforces.status(handle, 1000, refresh=True)
        except HTTPException:
            continue

        for submission in remote:
            created = submission.get("creationTimeSeconds")
            problem = submission.get("problem") or {}
            contest_id = problem.get("contestId") or submission.get("contestId")
            index = problem.get("index")
            problem_id = f"{contest_id}-{index}" if contest_id and index else ""
            if not created or problem_id not in problem_by_id:
                continue

            submitted_at = datetime.fromtimestamp(created, tz=timezone.utc)
            if submitted_at < start_at or submitted_at > end_at:
                continue

            all_attempts.append({
                "id": f"codeforces-{submission.get('id')}",
                "participant": handle,
                "problemId": problem_id,
                "verdict": submission.get("verdict") or "TESTING",
                "submittedAt": submitted_at.isoformat(),
            })

    all_attempts.sort(key=lambda item: item["submittedAt"])
    problem_results = []
    ranking = []

    for handle in session.participants:
        participant_attempts = [
            item for item in all_attempts if item["participant"] == handle
        ]
        solved_count = 0
        penalty_seconds = 0

        for problem in session.problems:
            problem_id = str(problem.get("id"))
            attempts = [
                item for item in participant_attempts
                if item["problemId"] == problem_id
            ]
            attempts.sort(key=lambda item: item["submittedAt"])

            accepted_attempt = next(
                (item for item in attempts if item["verdict"] == "OK"),
                None,
            )
            judged_attempts = [
                item for item in attempts
                if item["verdict"] not in {"TESTING", "PENDING"}
            ]
            wrong_before_accept = 0
            if accepted_attempt:
                accepted_time = accepted_attempt["submittedAt"]
                wrong_before_accept = sum(
                    1 for item in attempts
                    if item["submittedAt"] <= accepted_time
                    and item["verdict"] not in {"OK", "TESTING", "PENDING"}
                )
                elapsed = max(
                    0,
                    int((
                        datetime.fromisoformat(accepted_time) - start_at
                    ).total_seconds()),
                )
                solved_count += 1
                penalty_seconds += elapsed + wrong_before_accept * 600
                status = "accepted"
                elapsed_seconds = elapsed
                last_submitted_at = accepted_time
            elif judged_attempts:
                status = "error"
                wrong_before_accept = len([
                    item for item in judged_attempts if item["verdict"] != "OK"
                ])
                last_submitted_at = attempts[-1]["submittedAt"]
                elapsed_seconds = max(
                    0,
                    int((
                        datetime.fromisoformat(last_submitted_at) - start_at
                    ).total_seconds()),
                )
            elif attempts:
                status = "pending"
                last_submitted_at = attempts[-1]["submittedAt"]
                elapsed_seconds = max(
                    0,
                    int((
                        datetime.fromisoformat(last_submitted_at) - start_at
                    ).total_seconds()),
                )
            else:
                status = "not_submitted"
                last_submitted_at = None
                elapsed_seconds = None

            problem_results.append({
                "participant": handle,
                "problemId": problem_id,
                "status": status,
                "attempts": len(attempts),
                "wrongAttempts": wrong_before_accept,
                "elapsedSeconds": elapsed_seconds,
                "submittedAt": last_submitted_at,
                "verdict": accepted_attempt["verdict"] if accepted_attempt else (
                    attempts[-1]["verdict"] if attempts else None
                ),
            })

        ranking.append({
            "participant": handle,
            "solved": solved_count,
            "penaltySeconds": penalty_seconds,
            "attempts": len(participant_attempts),
            "lastSubmissionAt": max(
                (item["submittedAt"] for item in participant_attempts),
                default=None,
            ),
        })

    # Critério de competição: mais problemas aceitos; desempate por menor penalidade.
    ranking.sort(key=lambda row: (-row["solved"], row["penaltySeconds"], row["participant"].lower()))
    payload["submissions"] = all_attempts
    return {
        **payload,
        "ranking": ranking,
        "problemResults": problem_results,
    }
