import asyncio,time
import httpx
from fastapi import HTTPException
BASE="https://codeforces.com/api"
_lock=asyncio.Lock(); _last=0.0; _cache={}
async def call(method,params=None):
 global _last
 key=(method,tuple(sorted((params or {}).items())))
 cached=_cache.get(key)
 if cached and time.monotonic()-cached[0]<60:return cached[1]
 async with _lock:
  delay=2.05-(time.monotonic()-_last)
  if delay>0:await asyncio.sleep(delay)
  try:
   async with httpx.AsyncClient(timeout=20) as c:
    r=await c.get(f"{BASE}/{method}",params=params or {});r.raise_for_status();data=r.json()
  except (httpx.HTTPError,ValueError):raise HTTPException(502,"Falha ao consultar Codeforces.")
  finally:_last=time.monotonic()
 if data.get("status")!="OK":raise HTTPException(404 if "not found" in data.get("comment","").lower() else 502,data.get("comment","Erro Codeforces"))
 _cache[key]=(time.monotonic(),data["result"]);return data["result"]
async def info(handle):
 result=await call("user.info",{"handles":handle.strip()})
 if not result:raise HTTPException(404,"Handle não encontrado.")
 return result[0]
async def rating(handle):return await call("user.rating",{"handle":handle.strip()})
async def status(handle,count=100):return await call("user.status",{"handle":handle.strip(),"from":1,"count":count})
async def problems(tags=None):return await call("problemset.problems",{"tags":tags} if tags else {})
