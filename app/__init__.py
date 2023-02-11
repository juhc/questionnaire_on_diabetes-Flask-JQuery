from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import os

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    from .models import (
        PassportChoice,
        PassportQuestion,
        Questions,
        QuestionsAnswer,
        Recomendations,
        Risks,
        DEBQ,
        DSM_V_Answers,
        DSM_V_Questions,
        KnowledgeQuestions,
    )

    db.init_app(app)
    create_db(app)

    from .home import home

    app.register_blueprint(home, url_prefix="/")

    return app


def create_db(app):
    with app.app_context():
        if not os.path.exists(app.config["DB_NAME"]):
            db.create_all()
