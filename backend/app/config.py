from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "signal-clone-secret-key-change-in-production"
    DATABASE_URL: str = "sqlite+aiosqlite:///./signal.db"
    OTP_CODE: str = "123456"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ALGORITHM: str = "HS256"

settings = Settings()
