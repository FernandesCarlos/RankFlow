from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core import settings
from app.database import Base, engine, get_db
from app.models import User
from app import codeforces
from app.auth import router as auth_router

cfg = settings()
Base.metadata.create_all(bind=engine)

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
    user, rating_history, solved = await __import__("asyncio").gather(
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
