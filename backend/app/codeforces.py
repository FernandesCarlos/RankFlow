import asyncio
import random
import time

import httpx
from fastapi import HTTPException

BASE = "https://codeforces.com/api"
_lock = asyncio.Lock()
_last = 0.0
_cache = {}
_submission_cache = {}


async def call(method, params=None):
    global _last
    normalized_params = params or {}
    key = (method, tuple(sorted(normalized_params.items())))
    cached = _cache.get(key)
    if cached and time.monotonic() - cached[0] < 60:
        return cached[1]

    async with _lock:
        cached = _cache.get(key)
        if cached and time.monotonic() - cached[0] < 60:
            return cached[1]

        delay = 2.05 - (time.monotonic() - _last)
        if delay > 0:
            await asyncio.sleep(delay)

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{BASE}/{method}",
                    params=normalized_params,
                )
                response.raise_for_status()
                data = response.json()
        except (httpx.HTTPError, ValueError):
            raise HTTPException(502, "Falha ao consultar Codeforces.")
        finally:
            _last = time.monotonic()

    if data.get("status") != "OK":
        comment = data.get("comment", "Erro Codeforces")
        status_code = 404 if "not found" in comment.lower() else 502
        raise HTTPException(status_code, comment)

    result = data["result"]
    _cache[key] = (time.monotonic(), result)
    return result


async def info(handle):
    result = await call("user.info", {"handles": handle.strip()})
    if not result:
        raise HTTPException(404, "Handle não encontrado.")
    return result[0]


async def rating(handle):
    return await call("user.rating", {"handle": handle.strip()})


async def status(handle, count=100):
    return await call(
        "user.status",
        {"handle": handle.strip(), "from": 1, "count": count},
    )


async def problems(tags=None):
    params = {"tags": tags} if tags else {}
    return await call("problemset.problems", params)


def problem_key(problem, fallback_contest_id=None):
    contest_id = problem.get("contestId") or fallback_contest_id
    index = problem.get("index", "")
    if contest_id is not None:
        return f"{contest_id}-{index}"
    problemset = problem.get("problemsetName") or "gym"
    return f"{problemset}-{index}"


async def all_submissions(handle):
    normalized = handle.strip()
    cached = _submission_cache.get(normalized.lower())
    if cached and time.monotonic() - cached[0] < 300:
        return cached[1]

    submissions = []
    start = 1
    page_size = 1000

    while True:
        page = await call(
            "user.status",
            {"handle": normalized, "from": start, "count": page_size},
        )
        submissions.extend(page)
        if len(page) < page_size:
            break
        start += len(page)

    _submission_cache[normalized.lower()] = (time.monotonic(), submissions)
    return submissions


def _solved_data(submissions):
    solved = {}
    latest_submission = None

    for submission in submissions:
        created_at = submission.get("creationTimeSeconds")
        if created_at is not None:
            latest_submission = max(latest_submission or 0, created_at)

        if submission.get("verdict") != "OK":
            continue

        problem = submission.get("problem") or {}
        key = problem_key(problem, submission.get("contestId"))
        if key not in solved:
            solved[key] = problem

    tag_counts = {}
    for problem in solved.values():
        for tag in problem.get("tags") or []:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    tag_stats = [
        {"tag": tag, "solved": count}
        for tag, count in sorted(
            tag_counts.items(),
            key=lambda item: (-item[1], item[0]),
        )
    ]

    return {
        "solvedCount": len(solved),
        "submissionCount": len(submissions),
        "tagStats": tag_stats,
        "lastSubmissionAt": latest_submission,
    }, set(solved.keys())


async def solved_summary(handle):
    submissions = await all_submissions(handle)
    summary, _ = _solved_data(submissions)
    return summary


async def problem_tags():
    data = await problems()
    names = {
        tag
        for problem in data.get("problems", [])
        for tag in problem.get("tags", [])
    }
    return sorted(names)


async def generate_training(handle, quantity, min_rating, max_rating, tags=None):
    if min_rating > max_rating:
        raise HTTPException(422, "A dificuldade mínima não pode superar a máxima.")

    selected_tags = set(tags or [])
    problemset, submissions = await asyncio.gather(
        problems(),
        all_submissions(handle),
    )
    _, solved_keys = _solved_data(submissions)

    candidates = []
    for problem in problemset.get("problems", []):
        rating_value = problem.get("rating")
        if rating_value is None or not min_rating <= rating_value <= max_rating:
            continue

        problem_tags = problem.get("tags") or []
        if selected_tags and not selected_tags.intersection(problem_tags):
            continue

        if problem_key(problem) in solved_keys:
            continue

        contest_id = problem.get("contestId")
        index = problem.get("index")
        if contest_id is None or not index:
            continue

        candidates.append({
            "id": f"{contest_id}-{index}",
            "contestId": contest_id,
            "index": index,
            "title": problem.get("name", f"Problema {contest_id}{index}"),
            "rating": rating_value,
            "tags": problem_tags,
            "tag": next(
                (tag for tag in problem_tags if tag in selected_tags),
                problem_tags[0] if problem_tags else "sem tag",
            ),
            "url": f"https://codeforces.com/problemset/problem/{contest_id}/{index}",
        })

    if len(candidates) < quantity:
        raise HTTPException(
            422,
            (
                f"Foram encontrados apenas {len(candidates)} problemas não resolvidos "
                "com esses filtros. Amplie a faixa de dificuldade ou remova algumas tags."
            ),
        )

    selected = random.SystemRandom().sample(candidates, quantity)
    selected.sort(key=lambda item: item["rating"])

    return {
        "quantity": quantity,
        "min": min_rating,
        "max": max_rating,
        "tags": sorted(selected_tags),
        "problems": selected,
    }
