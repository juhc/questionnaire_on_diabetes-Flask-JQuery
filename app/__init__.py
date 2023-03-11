from flask import Flask, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from config import Config
import os

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    from .models import (
        Question,
        Answer,
        Group,
        Recomendations,
        Results,
        Texts
    )

    db.init_app(app)
    create_db(app)

    from .home import home

    app.register_blueprint(home, url_prefix="/")

    @app.errorhandler(404)
    def page_not_found(error):
        return redirect(url_for('home.index'))

    return app


def create_db(app):
    with app.app_context():
        if not os.path.exists(app.config["DB_NAME"]):
            db.create_all()
