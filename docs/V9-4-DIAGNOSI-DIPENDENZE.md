# V9.4 — Diagnosi dipendenze e prerequisiti nativi

`npm run diagnose:dependencies` legge lo stato del progetto senza modificare file, installare pacchetti o avviare build. Mostra la versione Node/npm, la presenza di lockfile e `node_modules`, la risoluzione dei moduli crittografici e gli strumenti di build disponibili.

Un modulo dichiarato in `package.json` non è necessariamente installato. Il controllo `npm run check:crypto-runtime` è significativo solo dopo una installazione riuscita: deve poter risolvere e caricare gli export Noble, Base64 ed Expo Crypto richiesti dal codice.

La diagnosi dell'ambiente host non certifica la compatibilità nativa di SQLCipher. Questa richiede almeno una prebuild Expo riuscita, una build custom nativa e prove su dispositivo/emulatore con apertura, chiusura, riavvio e migrazione del database.
