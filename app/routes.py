from flask import Blueprint, request, jsonify, json, render_template, session
from pymongo import MongoClient
from datetime import datetime
from .models import ActionSchema
from .env import MONGO_DB_URI

client = MongoClient(MONGO_DB_URI)
db = client['TechStax']
collection = db['actions']

main = Blueprint('main', __name__)

@main.route('/webhook', methods=['POST'])
def handle_webhook():
    data = request.json

    record = {}

    if 'pusher' in data and 'head_commit' in data:
        request_id = data['head_commit']['id']
        author = data['pusher']['name']
        to_branch = data['ref'].split('/')[-1]
        timestamp = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        action = "PUSH"
        record = {
            "request_id" : request_id,
            "author" : author,
            "action" : action,
            "to_branch" : to_branch,
            "timestamp" : timestamp
        }
        message = f"{author} pushed to {to_branch} on {timestamp}"
    
    elif 'pull_request' in data and data['action'] == 'opened':
        request_id = str(data['pull_request']['id'])
        author = data['pull_request']['user']['login']
        from_branch = data['pull_request']['head']['ref']
        to_branch = data['pull_request']['base']['ref']
        timestamp = datetime.now().strftime("%m/%d/%Y, %H:%M:%S %z")
        action = "PULL_REQUEST"
        record = {
            "request_id" : request_id,
            "author" : author,
            "action" : action,
            "from_branch" : from_branch,
            "to_branch" : to_branch,
            "timestamp" : timestamp
        }
        message = f"{author} submitted a pull request from {from_branch} to {to_branch} on {timestamp}"
    
    elif 'pull_request' in data and data['action'] == 'closed' and data['pull_request']['merged']:
        request_id = str(data['pull_request']['id'])
        author = data['pull_request']['user']['login']
        from_branch = data['pull_request']['head']['ref']
        to_branch = data['pull_request']['base']['ref']
        timestamp = datetime.now().strftime("%m/%d/%Y, %H:%M:%S %z")
        action = "MERGE"
        record = {
            "request_id" : request_id,
            "author" : author,
            "action" : action,
            "from_branch" : from_branch,
            "to_branch" : to_branch,
            "timestamp" : timestamp
        }
        message = f"{author} merged branch {from_branch} to {to_branch} on {timestamp}"

    schema = ActionSchema()
    entry = schema.load(record)
    collection.insert_one(entry)
    return jsonify({"status": "success", "message": "Entry recorded in Mongo DB"})

@main.route('/fetch', methods=['GET'])
def fetch_actions():
    dataset = collection.find({}).sort({"timestamp":-1})
    response = []
    for data in dataset:
        response.append(data)
    return json.dumps({"response":response},default = str)


@main.route('/view', methods=['GET'])
def create_view():
    return render_template('index.html')

