import requests
from flask import Flask, request, redirect, render_template, abort
from flask_accept import accept

app = Flask(__name__)
app.config.from_envvar('VIDEOMETA_SETTINGS')
root_url = app.config['VIDEOMETA_ROOT']
query_url = app.config['VIDEOMETA_INTERNAL']

@app.route("/")
def home():
    return render_template('home.html')

@app.route("/<video>")
@accept("text/html")
def getmeta(video):
    print('meta', request.headers)
    check = requests.head('{}/raw/{}.mp4'.format(root_url, video))

    if check.status_code != 200:
        return abort(404)

    return render_template('meta.html',
        title=video,
        url='{}/raw/{}.mp4'.format(root_url, video),
        thumb='{}/thumb/{}.jpg'.format(root_url, video),
        sources=[{
                'url': '{}/dash/{}.mpd'.format(root_url, video),
                'type': 'application/dash+xml'
            }, {
                'url': '{}/dash/{}.m3u8'.format(root_url, video),
                'type': 'application/vnd.apple.mpegurl'
            }, {
                'url': '{}/{}.mp4'.format(root_url, video),
                'type': 'video/mp4'
            }])

