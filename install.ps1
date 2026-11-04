# Installation de Crossfade Tight (Windows)
$ErrorActionPreference = "Stop"

if (-not (Get-Command spicetify -ErrorAction SilentlyContinue)) {
    Write-Host "Spicetify est introuvable. Installe-le d'abord : https://spicetify.app" -ForegroundColor Red
    exit 1
}

$ext = Join-Path $env:APPDATA "spicetify\Extensions"
New-Item -ItemType Directory -Force -Path $ext | Out-Null
Copy-Item (Join-Path $PSScriptRoot "crossfade-tight.js") $ext -Force

spicetify config extensions crossfade-tight.js
spicetify apply

Write-Host "Installation terminée. Redémarre Spotify si besoin." -ForegroundColor Green
