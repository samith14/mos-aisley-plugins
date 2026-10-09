#!/bin/sh
# stay-current: print what's current (newest AI models, newest software
# versions, this week's news) for Claude Code to add as session context.
#
# One GET to https://mosaisley.com/cantina/papers/brief, with nothing that
# identifies you, at most once every 3 hours: the answer is cached on disk.
# If the network fails, a cached copy up to a week old is used; otherwise the
# hook prints nothing and the session starts as usual. It never blocks or fails
# a session.
#
# Optional: MOSAISLEY_STACK="python,nodejs,nextjs" narrows the software list
# (endoflife.date slugs or product names).

URL="https://mosaisley.com/cantina/papers/brief"
if [ -n "$MOSAISLEY_STACK" ]; then
  STACK=$(printf '%s' "$MOSAISLEY_STACK" | tr -cd 'A-Za-z0-9,._ -' | sed 's/ /%20/g')
  URL="$URL?only=$STACK"
fi

DIR="${CLAUDE_PLUGIN_DATA:-${XDG_CACHE_HOME:-$HOME/.cache}/mos-aisley-stay-current}"
mkdir -p "$DIR" 2>/dev/null || exit 0
KEY=$(printf '%s' "$URL" | cksum | cut -d' ' -f1)
CACHE="$DIR/brief-$KEY.txt"

# Fresh enough: younger than 3 hours (180 minutes).
if [ -s "$CACHE" ] && [ -n "$(find "$CACHE" -mmin -180 2>/dev/null)" ]; then
  cat "$CACHE"
  exit 0
fi

TMP="$CACHE.$$"
if curl -fsS -m 5 -A "stay-current/1.0 (Claude Code plugin; +https://github.com/samith14/mos-aisley-plugins)" "$URL" -o "$TMP" 2>/dev/null && [ -s "$TMP" ]; then
  mv "$TMP" "$CACHE"
  cat "$CACHE"
  exit 0
fi
rm -f "$TMP"

# Offline: a copy up to a week old, labeled as such.
if [ -s "$CACHE" ] && [ -n "$(find "$CACHE" -mmin -10080 2>/dev/null)" ]; then
  echo "(stay-current: offline, so this is the copy from $(date -r "$CACHE" '+%Y-%m-%d %H:%M' 2>/dev/null || echo 'earlier this week'))"
  cat "$CACHE"
fi
exit 0
