__author__ = 'David Gotz, gotz@unc.edu, Onyen = gotz'

from flask import Flask, render_template
from flask import request
from flask import url_for
from markupsafe import escape

# Create a Flask web application server
# __name__ is a "special" variable (notice the underscores) and its value is the name of the current module
# (remember that imports pull in additional modules, like random). Flask uses this to configure itself.
app = Flask(__name__)

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
    task_cnt = request.args.get('task_cnt')
    permutation = request.args.get('permutation')
    return render_template('/task_description.html', task_cnt=task_cnt,permutation=permutation)

@app.route("/post_task")
def post_task():
    return render_template('/post_task.html')

@app.route("/finish")
def finish():
    return render_template('/finish.html')



@app.route("/search")
def tips():
    keywords = request.args.get('keywords')

    html_result = "<form method='get' action='/search'>"
    html_result += "Keywords to search for: <input id='keywords' value='"+keywords+"' name='keywords' size='50'/>"
    html_result += "<input type='submit' value='Submit' />"
    html_result += "</form><p>"
    html_result += "<h3>Search Results</h3><p><ol>"

    for tweet in app.trump_tweets:
        if keywords in tweet:
            # Add bold tag around the keywords
            tweet = tweet.replace(keywords, "<b>"+keywords+"</b>")
            html_result += "<li>" + tweet

    html_result += "</ol>"

    return html_result


# Run the web server.
def main():
    # Open tweet data from https://www.thetrumparchive.com/ with over 55,000 tweets.
    app.trump_tweets = open("trump_tweets.csv", "r").readlines()

    app.run(port=3000)

if __name__ == '__main__':
    main()
