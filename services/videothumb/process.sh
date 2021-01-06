#!/bin/bash

for video in ${VIDEO_DIR}/*.mp4; do
    python $(dirname $0)/thumbnailer.py $video ${THUMBNAILS_DIR}/
done
