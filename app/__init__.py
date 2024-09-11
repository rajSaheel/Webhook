from flask import Flask, render_template
from pymongo import MongoClient
from flask_cors import CORS
from .env import SECRET_KEY


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SECRET_KEY'] = SECRET_KEY

    # @app.errorhandler(404)
    # def handle_all_errors(e):
    #     print(e)
    #     error_code = getattr(e, 'code', 500)
    #     return render_template('error.html', error_code=error_code, error_message=str(e))

    from .routes import main
    app.register_blueprint(main)

    return app

