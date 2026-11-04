# Crossfade Tight

Extension [Spicetify](https://spicetify.app) qui crée un **enchaînement serré façon crossfade / automix** sur Spotify, y compris avec un **compte gratuit**.

![License](https://img.shields.io/badge/license-MIT-green)
![Spicetify](https://img.shields.io/badge/Spicetify-extension-1db954)

> **Made By Us3r. | If u Paid u get scam**

## Ce que fait l'extension

- Fait descendre le volume sur la fin du morceau (fade-out).
- Lance le morceau suivant **avant la fin réelle** du précédent.
- Remonte le volume sur le nouveau morceau (fade-in).
- Un **menu de réglages** intégré permet de tout configurer sans toucher au code.

## Limite importante

Ce n'est **pas une vraie superposition** de deux morceaux. Spotify n'utilise qu'un seul flux audio chiffré, et une extension Spicetify ne peut ni en lancer un second ni accéder à l'audio brut. Le résultat est un fondu enchaîné très serré, avec un court creux (quelques centaines de millisecondes) le temps que Spotify charge le morceau suivant. Le crossfade natif de Spotify reste réservé à Premium.

## Installation

### Prérequis

[Spicetify](https://spicetify.app/docs/getting-started) installé et fonctionnel.

### Avec le script (recommandé)

Télécharge ou clone le dépôt, puis :

**Windows (PowerShell)**
```powershell
.\install.ps1
```

**Linux / macOS**
```bash
./install.sh
```

### À la main

1. Copie `crossfade-tight.js` dans le dossier `Extensions` de Spicetify :
   - Windows : `%appdata%\spicetify\Extensions`
   - Linux / macOS : `~/.config/spicetify/Extensions`
2. Lance :
   ```
   spicetify config extensions crossfade-tight.js
   spicetify apply
   ```
3. Redémarre complètement Spotify.

### Spicetify Marketplace

Le dépôt contient un `manifest.json` compatible avec le Marketplace. Une fois le dépôt publié sur GitHub avec le topic `spicetify-extensions`, l'extension peut y apparaître.

## Utilisation

Ouvre le menu de réglages :

- via le menu de ton profil (clic sur l'avatar) : **« Crossfade : réglages »** ;
- via le bouton de la barre du haut, si ta version de Spicetify l'affiche ;
- ou en tapant `crossfadeTightMenu()` dans la console de DevTools.

| Réglage | Rôle | Défaut |
|---|---|---|
| Activer le crossfade | Active ou coupe l'extension | activé |
| Durée du fade-out | Temps avant la fin où le volume descend | 3,0 s |
| Lancer le morceau suivant à | % du fade-out après lequel on passe au suivant (plus bas = plus serré) | 80 % |
| Durée du fade-in | Temps de remontée du volume | 1,8 s |
| Volume plancher | Volume minimum pendant le fondu | 0 % |
| Courbe du fondu | Douce, linéaire ou exponentielle | douce |
| Ignorer les morceaux courts | Pas de fondu sous cette durée | 20 s |
| Logs | Messages dans la console | activé |

Les réglages s'appliquent immédiatement et sont enregistrés. Le bouton **« Tester sur ce morceau »** place la lecture quelques secondes avant la fin pour entendre le résultat.

Les pubs et la répétition d'un seul morceau sont ignorées.

## Dépannage

Ouvre la console : `spicetify enable-devtools`, redémarre Spotify, clic droit > *Inspecter l'élément* > *Console*, puis filtre sur `crossfade-tight`.

- **Aucun message** : l'extension n'est pas chargée. Vérifie `spicetify config extensions`, relance `spicetify apply` et redémarre Spotify.
- **`en attente de l'API...` en boucle** : lance un morceau. Si ça persiste, mets Spicetify à jour.
- **Erreurs `reading '_state'` ou `reading 'call'`** : ta version de Spicetify est en retard sur celle de Spotify. Lance `spicetify update`, puis `spicetify restore backup apply`.
- **Le morceau suivant démarre trop tard ou trop tôt** : baisse « Lancer le morceau suivant à » pour un enchaînement plus serré.

## Désinstallation

```
spicetify config extensions crossfade-tight.js-
spicetify apply
```
Supprime ensuite `crossfade-tight.js` du dossier `Extensions`.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Les bugs et idées passent par les [issues](../../issues).

## Licence

[MIT](LICENSE)
