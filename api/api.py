#!/usr/bin/env python3
import os
import re
import base64
import pathlib
import time

# pylint: disable=E0401
from mpd import MPDClient
from flask import Flask, jsonify

mpd_host = os.environ.get("MPD_HOST", "::1")
mpd_port = os.environ.get("MPD_PORT", 6600)
api_host = os.environ.get("RADIO_API_HOST", "localhost")
api_port = os.environ.get("RADIO_API_PORT", 9969)

musicLibrary = os.environ.get("RADIO_MUSIC_DIR", "/Music")

api = Flask(__name__)
mpd = False


class MPDWrapper:
    def __init__(self):
        self.client = MPDClient()
        self.client.timeout = 1
        self.client.idletimeout = None
        print(f"Connecting to MPD at {mpd_host}:{mpd_port}")
        self.connect()
        print(self.client.status())

    def connect(self):
        self.client.connect(mpd_host, mpd_port)

    def get_current_song(self):
        song = self.client.currentsong()
        song["system"] = song["file"].split("/")[0]
        song["game"] = song["file"].split("/")[1]
        song.setdefault("artist", "Unknown Artist")
        song.setdefault("album", "Unknown Album")
        song.setdefault("title", song["file"].split("/")[-1])
        song["cover"] = encodeCoverArt(os.path.dirname(song["file"]))
        return song

    def get_status(self):
        return self.client.status()

    def wait_for_change(self):
        return self.client.idle("player")

    def reconnect(self):
        try:
            self.connect()
            time.sleep(0.250)
        except:
          pass


def encodeCoverArt(path):
    try:
        regex = re.compile(r"(cover)\.(gif|jpeg|jpg|png|webp)$", re.I | re.X)
        fullpath = f"{musicLibrary}/{path}"
        for e in os.listdir(fullpath):
            if regex.match(e) is not None:
                cover_art = f"{fullpath}/{e}"
        # fallback to system art
        art = cover_art or f"{os.path.dirname(fullpath)}/cover.png"
        with open(art, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
        ext = pathlib.Path(art).suffix
        return f"data:image/{ext};base64, {encoded_string.decode("utf-8")}"
    except:
        return ""

# TODO run ping command for reconnect
def get_song():
    try:
        song = mpd.get_current_song()
    except:
        mpd.reconnect()
        song = mpd.get_current_song() or None

    try:
        song = mpd.get_current_song() if song is None else song
    except:
        song = "error"

    return song


def get_status():
    try:
        status = mpd.get_status()
    except:
        mpd.reconnect()
        status = mpd.get_status() or None

    try:
        status = mpd.get_status() if status is None else status
    except:
        status = "error"

    return status


@api.route("/", methods=["GET"])
def now_playing():
    return jsonify({"song": get_song(), "status": get_status()})


@api.route("/status", methods=["GET"])
def serve_status():
    return jsonify(get_status())


## Todo: maybe there should be another thread that keeps the connection going
@api.route("/song", methods=["GET"])
def serve_song():
    return jsonify(get_song())


def main():
    global mpd
    mpd = MPDWrapper()
    print(f"Starting flask on {api_host}")
    api.run(host=api_host, port=api_port)  # todo: config port i guess


if __name__ == "__main__":
    main()
