#!/bin/sh
# Regenerate every app icon from scripts/icons/*.svg (needs: brew install librsvg imagemagick).
#   icon-full.svg      full-square art (no transparency) — iOS home screen + manifest
#   icon-maskable.svg  car kept inside the Android safe zone
#   public/icon.svg    rounded version used as the browser-tab favicon
set -e
cd "$(dirname "$0")/.."
SRC=scripts/icons
OUT=public
for s in 180 167 152; do rsvg-convert -w $s -h $s $SRC/icon-full.svg -o $OUT/apple-touch-icon-$s.png; done
cp $OUT/apple-touch-icon-180.png $OUT/apple-touch-icon.png
rsvg-convert -w 192 -h 192 $SRC/icon-full.svg -o $OUT/icon-192.png
rsvg-convert -w 512 -h 512 $SRC/icon-full.svg -o $OUT/icon-512.png
rsvg-convert -w 512 -h 512 $SRC/icon-maskable.svg -o $OUT/icon-maskable-512.png
for s in 16 32 48; do rsvg-convert -w $s -h $s $OUT/icon.svg -o /tmp/lg-fav-$s.png; done
magick /tmp/lg-fav-16.png /tmp/lg-fav-32.png /tmp/lg-fav-48.png $OUT/favicon.ico
rm -f /tmp/lg-fav-*.png
# iOS puts a black background behind transparent pixels — make sure there are none.
for f in $OUT/apple-touch-icon*.png $OUT/icon-192.png $OUT/icon-512.png $OUT/icon-maskable-512.png; do
  magick "$f" -background '#29b6f6' -alpha remove -alpha off "$f"
done
echo "icons written"
