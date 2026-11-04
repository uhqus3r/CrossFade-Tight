# Contribuer

Les contributions sont les bienvenues.

1. Fais un fork du dépôt, puis crée une branche (`git checkout -b ma-fonctionnalite`).
2. Modifie `crossfade-tight.js` et teste dans Spotify (`spicetify apply`, puis redémarrage).
3. Vérifie la syntaxe : `node --check crossfade-tight.js`.
4. Ajoute une ligne dans `CHANGELOG.md`.
5. Ouvre une Pull Request en décrivant ce qui change et avec quelle version de Spotify / Spicetify tu as testé.

Pour un bug, ouvre d'abord une issue avec la version de Spotify, la version de Spicetify
(`spicetify -v`) et les logs de la console filtrés sur `crossfade-tight`.
