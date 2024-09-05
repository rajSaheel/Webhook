from flask import Flask
from pymongo import MongoClient

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'ajsdhgf8765bweirug9'

    from .routes import main
    app.register_blueprint(main)

    return app
