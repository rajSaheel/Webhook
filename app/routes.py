from flask import Blueprint, request, jsonify, json, render_template
from pymongo import MongoClient
from datetime import datetime, timedelta
from .models import ActionSchema
from .env import MONGO_DB_URI
from bson import json_util

client = MongoClient(MONGO_DB_URI)
db = client['TechStax']
collection = db['actions']

main = Blueprint('main', __name__)

@main.route('/webhook', methods=['POST'])
def handle_webhook():
    try:
        data = request.json
        record = {}

        if 'pusher' in data and 'head_commit' in data:
            request_id = data['head_commit']['id']
            author = data['pusher']['name']
            to_branch = data['ref'].split('/')[-1]
            timestamp = datetime.now().strftime(format="%d/%m/%Y, %H:%M:%S")
            
            action = "PUSH"
            record = {
                "request_id" : request_id,
                "author" : author,
                "action" : action,
                "to_branch" : to_branch,
                "timestamp" : timestamp
            }
        
        elif 'pull_request' in data:
            request_id = str(data['pull_request']['id'])
            author = data['pull_request']['user']['login']
            from_branch = data['pull_request']['head']['ref']
            to_branch = data['pull_request']['base']['ref']
            timestamp = datetime.now().strftime(format="%d/%m/%Y, %H:%M:%S")
            action = "MERGE" if data["pull_request"]['merged']  else "PULL_REQUEST"
            record = {
                "request_id" : request_id,
                "author" : author,
                "action" : action,
                "from_branch" : from_branch,
                "to_branch" : to_branch,
                "timestamp" : timestamp
            }
        print(record['timestamp'])
        schema = ActionSchema()
        entry = schema.load(record)
        collection.insert_one(entry)
        return jsonify({"status": "success", "message": "Entry recorded in DB"})
    
    except Exception as e:
        print(e)
        return jsonify({"status":"failed","message":"error in saving entry","error":e})


@main.route('/fetch', methods=['GET'])
def fetch_actions():
    try:
        query = request.args.get('count')
        page = int(request.args.get('page',"1"))
        page_size = int(request.args.get('page_size',"10"))
        actions = []
        count = 0
        if query=="all":
            skip = (page - 1) * page_size
            count = collection.count_documents({})
            actions = [data for data in collection.find().sort({"timestamp":-1}).skip(skip).limit(page_size)]
        else:
            now = datetime.now()
            lapse = now - timedelta(seconds=15)
            time = lapse.strftime(format="%d/%m/%Y, %H:%M:%S")
            actions = [data for data in collection.find({"timestamp":{"$gt":time}}).sort({"timestamp":-1})]
            count = len(actions)
        return json.dumps({"actions":actions,"count":count}, default = str)
    except Exception as e:
        return jsonify({"status":"failed","message":"error in fetching data","error":e})


@main.route('/view', methods=['GET'])
def create_view():
    try:
        return render_template('index.html')
    except Exception as e:
        return "Server Error, Please Try Again!"
        


