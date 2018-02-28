#!/bin/bash

SRC_DIR="coffeecutie"
OUTPUT_DIR="blog/content/readme/"

mkdir -p "$OUTPUT_DIR"

if [ ! -d $SRC_DIR ]; then
    echo "-- Failed to locate source directory!"
    exit 1
fi

for readme in $SRC_DIR/*.md; do
    echo "++ Processing $readme"
    HEADER="$(head -1 $readme | sed -e 's/^#[ ]*//g')"

    TAG="$(echo $readme | cut -d'.' -f 2)"

    if [ "$TAG" = "md" ]; then
        TAG="$(echo $(basename $readme) | cut -d'.' -f 1)"
    fi

    HEADER="$TAG - $HEADER"

    LINES="$(($(cat $readme | wc -l) - 1))"
    CONTENT="$(tail -$LINES $readme)"

    echo "+++ Headline: $HEADER"
    echo "+++ Lines: $LINES"
    echo "+++ Content:$CONTENT"

    echo "
---
title: $HEADER
draft: false
tags:
  - coffeecutie
  - $TAG
---

$CONTENT" > $OUTPUT_DIR/$(basename $readme)
done
