#!/bin/sh
# Package each plugin in src/ as its own zip in dist/: the plugin's files plus src/shared.
set -e
cd "$(dirname "$0")"
node tools/gen-presets.js
rm -rf dist && mkdir dist
for dir in src/*/; do
  plugin=$(basename "$dir")
  [ "$plugin" = shared ] && continue
  stage=$(mktemp -d)
  cp src/shared/* "$dir"* "$stage"/
  (cd "$stage" && zip -qr "$OLDPWD/dist/vocat-$plugin.zip" . -x '.*')
  rm -rf "$stage"
done
shasum -a 256 dist/*.zip
