from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Lecta AI API"
    environment: str = "development"
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_db_url: str = ""
    redis_url: str = "redis://localhost:6379/0"
    groq_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()