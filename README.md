# Open Day - Gioco e sito

Progetto web per l'Open Day dell'IIS Copernico-Carpeggiani.

## Struttura

```text
.
├── site/
│   └── index.html       # Dashboard/hub 3D principale
└── game/
    ├── index.html       # Gioco "Acchiappa la Talpa"
    ├── css/
    │   └── styles.css
    └── js/
        └── game.js
```

## Avvio locale

Apri `site/index.html` per la dashboard oppure `game/index.html` per il gioco.
Per evitare limitazioni del browser sui moduli JavaScript, puoi avviare un server
locale dalla root:

```bash
python3 -m http.server 8000
```

Poi visita:

- <http://localhost:8000/site/>
- <http://localhost:8000/game/>
