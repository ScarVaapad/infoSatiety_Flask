__author__ = 'David Gotz, gotz@unc.edu, Onyen = gotz'

from flask import Flask, render_template, request, jsonify
from flask import url_for
from markupsafe import escape

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import json

# Create a Flask web application server
# __name__ is a "special" variable (notice the underscores) and its value is the name of the current module
# (remember that imports pull in additional modules, like random). Flask uses this to configure itself.
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']="postgresql://postgres:scar31251@localhost:5432/postgres"
db = SQLAlchemy(app)

with app.app_context():
    try:
        db.session.execute(text('SELECT 1'))
        print('Connected to the database')
    except Exception as e:
        print('Failed to connect to the database')
        print(e)

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

@app.route("/finish",methods=['GET','POST'])
def finish():
    render_template('/finish.html')
    data = request.get_json()
    print(data)

    return



# Run the web server.
def main():
    app.run(port=3000)


if __name__ == '__main__':
    main()
