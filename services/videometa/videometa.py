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

@app.errorhandler(404)
def fourohfour(code):
    return render_template('404.html'), 404

@app.route("/<video>")
def getmeta(video):
    if video.endswith('.mp4'):
        return redirect('{}/raw/{}'.format(root_url, video))

    check = requests.head('{}/raw/{}.mp4'.format(root_url, video))

    if check.status_code != 200:
        return abort(404)

    return render_template('meta.html',
        title=video,
        url='{}/{}'.format(root_url, video),
        preview='{}/raw/{}.mp4'.format(root_url, video),
        thumb='{}/thumb/{}.jpg'.format(root_url, video),
        sources=[{
                'url': '{}/dash/{}.mpd'.format(root_url, video),
                'type': 'application/dash+xml'
            }, {
                'url': '{}/hls/{}.m3u8'.format(root_url, video),
                'type': 'application/vnd.apple.mpegurl'
            }, {
                'url': '{}/raw/{}.mp4'.format(root_url, video),
                'type': 'video/mp4'
            }])

