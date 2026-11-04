# Changelog

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [1.0.0] - 2026-11-04

### Ajouté
- Fade-out sur la fin du morceau, passage anticipé au morceau suivant, puis fade-in.
- Menu de réglages intégré : activation, durées, volume plancher, courbe du fondu,
  durée minimale d'un morceau, logs. Réglages enregistrés automatiquement.
- Bouton « Tester sur ce morceau » et bouton « Réinitialiser ».
- Détection des pubs et de la répétition d'un seul morceau (pas de fondu dans ces cas).
- Lecture de l'état du lecteur via `Spicetify.Platform.PlayerAPI` (compatible avec les
  versions où `Spicetify.Player` est cassé).
- Scripts d'installation Windows (`install.ps1`) et Linux/macOS (`install.sh`).
- Manifeste `manifest.json` pour le Spicetify Marketplace.
