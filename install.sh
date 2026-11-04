#!/usr/bin/env bash
# Installation de Crossfade Tight (Linux / macOS)
set -e

if ! command -v spicetify >/dev/null 2>&1; then
  echo "Spicetify est introuvable. Installe-le d'abord : https://spicetify.app" >&2
  exit 1
fi

DIR="$(cd "$(dirname "$0")" && pwd)"
EXT="${XDG_CONFIG_HOME:-$HOME/.config}/spicetify/Extensions"
mkdir -p "$EXT"
cp "$DIR/crossfade-tight.js" "$EXT/"

spicetify config extensions crossfade-tight.js
spicetify apply

echo "Installation terminée. Redémarre Spotify si besoin."
