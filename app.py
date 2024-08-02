__author__ = 'David Gotz, gotz@unc.edu, Onyen = gotz'

from flask import Flask, render_template, request, jsonify, redirect
from flask import url_for
from markupsafe import escape

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from time import sleep
import json
import csv
import threading
import os

mountPath = 'data/data.csv'
# Hard coded schema for data logging in case localStorage pass extra lines other than intended ones and possible random order of items
schema = ['task_4', 'Personality', 'Demographic', 'tutorial_1', 'assignmentId', 'task_8', 'task_3', 'participantId', 'tutorial_2', 'task_5', 'tutorial_3', 'minivlat_score', 'projectId', 'task_6', 'task_2', 'task_1', 'userScores', 'Post_Task_Q', 'task_7', 'finalReward']
global_lock = threading.Lock()
def safe_write_csv(json_data):
    file_exists = os.path.isfile(mountPath)
    with global_lock:
        with open(mountPath,'a',newline='') as csvfile:
            writer = csv.writer(csvfile)

            if not file_exists:
                writer.writerow(schema)

            writer.writerow([json_data.get(key,"") for key in schema])

# Create a Flask web application server
# __name__ is a "special" variable (notice the underscores) and its value is the name of the current module
# (remember that imports pull in additional modules, like random). Flask uses this to configure itself.
app = Flask(__name__)

# DB if necessary
# app.config['SQLALCHEMY_DATABASE_URI']="postgresql://postgres:scar31251@localhost:5432/postgres"
# db = SQLAlchemy(app)
# class Data(db.Model):
#     id = db.Column(db.Integer,primary_key=True)
#     data = db.Column(db.JSON)
#
#     def __init__(self,data):
#         self.data = data
#
# with app.app_context():
#     try:
#         db.session.execute(text('SELECT 1'))
#         print('Connected to the database')
#     except Exception as e:
#         print('Failed to connect to the database')
#         print(e)

# Define the web pages.
@app.route("/")
@app.route("/index")
@app.route("/index.html")
def index():
    return render_template('/index.html')

@app.route("/information")
def information():
    return render_template('/information.html')

@app.route("/big5")
def big5():
    return render_template('/big5.html')

@app.route("/pre_miniVlat")
def pre_miniVlat():
    return render_template('/pre_miniVlat.html')

@app.route("/MiniVlat")
def miniVlat():
    vlatCnt = request.args.get('vlat_cnt')
    return render_template('/MiniVlat.html',vlat_cnt=vlatCnt)

@app.route("/post_MiniVlat")
def postMiniVlat():
    return render_template('/post_MiniVlat.html')

@app.route("/task_desc")
def task_desc():
    return render_template('/task_description.html')

@app.route("/sample")
def sample():
    samplecnt = request.args.get('samplecnt')
    permutationcnt = request.args.get('permutationcnt')
    return render_template('/sample.html',samplecnt=samplecnt, permutationcnt=permutationcnt)

@app.route("/pre_task")
def pre_task():
    return render_template('/pre_task.html')

@app.route("/task")
def task():
    task_cnt = request.args.get('taskCnt')
    permutationcnt = request.args.get('permutationcnt')
    return render_template('/task.html', taskCnt=task_cnt,permutationcnt=permutationcnt)

@app.route("/post_task")
def post_task():
    return render_template('/post_task.html')

@app.route("/questionnaire")
def questionnaire():
    return render_template('/questionnaire.html')

@app.route("/submit",methods=['POST'])
def submit():

    data = request.get_json()

    safe_write_csv(data) # defined above

    return redirect("/finish",code=302)

@app.route("/finish")
def finish():
    return render_template('/finish.html')

@app.route("/lafin")
def lafin():
    return redirect("https://connect.cloudresearch.com/participant/project/C733AD78DC/complete");

@app.route("/d_finish")
def d_finish():
    return render_template('/disqualify.html')


# Run the web server.
def main():
    app.run(host="0.0.0.0",port=3000)


if __name__ == '__main__':
    main()
