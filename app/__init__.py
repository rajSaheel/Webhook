from flask import Flask
from pymongo import MongoClient
from flask_cors import CORS
from .env import SECRET_KEY


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SECRET_KEY'] = SECRET_KEY

    from .routes import main
    app.register_blueprint(main)

    return app
