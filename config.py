import os


class Config:
    DEBUG = True
    SECRET_KEY = os.urandom(32).hex()
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    DB_NAME = f"{os.getcwd()}/data.db"
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_NAME}"
    DEBQ = "Выявление неправильных пищевых привычек"
    QUESTIONS = "Оценка риска развития сахарного диабета"
    PASSPORT = "Ваши данные"
    DSM_V = "Оценка нарушений пищевого поведения"
    RISKS = "Риск развития сахарного диабета"
    RECOMENDATIONS = "Рекомендации"
    INFO = "Что Вы знаете о диабете?"
