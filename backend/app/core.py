from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://rankflow:rankflow@localhost:5432/rankflow"
    jwt_secret: str
    jwt_expire_minutes: int = 10080
    session_secret: str
    codeforces_client_id: str = ""
    codeforces_client_secret: str = ""
    codeforces_discovery_url: str = "https://codeforces.com/.well-known/openid-configuration"
    codeforces_callback_url: str = "http://localhost:8000/api/auth/codeforces/callback"
    mobile_redirect_uri: str = "rankflow://auth/callback"
    cors_origins: str = "http://localhost:8081"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    @property
    def origins(self): return [x.strip() for x in self.cors_origins.split(",") if x.strip()]
@lru_cache
def settings(): return Settings()
