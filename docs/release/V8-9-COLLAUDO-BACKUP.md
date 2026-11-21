# V8.9 — Hardening del ripristino backup

Versione app: `1.0.25`.

## Modifiche

- Il repository verifica l'intero elenco di annotazioni prima di cifrare o scrivere righe: numero massimo, oggetti, identificatori, duplicati, tipo, titolo, corpo e date.
- La transazione continua a ricontrollare che il Diario sia vuoto prima di inserire i dati, evitando sovrascritture in caso di modifiche concorrenti.
- La schermata controlla esistenza, natura e dimensione del file selezionato prima di leggerlo; limite file: 20 MiB.
- La passphrase di importazione viene azzerata dopo l'autenticazione del backup o se l'utente annulla la selezione del file.

## Verifiche eseguibili in questo pacchetto

```bash
npm run test:all
```

I test Node verificano le regole del codice e i controlli statici. Non sono un collaudo della crittografia in runtime React Native, del file picker su Android/iOS o di SQLCipher nativo.

## Collaudo dispositivo ancora necessario

1. Generare un backup da un dispositivo Android con almeno tre annotazioni di tipi diversi.
2. Provare una passphrase errata e un file alterato: entrambi devono essere rifiutati.
3. Ripristinare il backup in una seconda installazione con Diario vuoto.
4. Confrontare numero, ID, tipo, titolo, corpo e date delle annotazioni.
5. Provare il ripristino in un Diario non vuoto: deve essere rifiutato senza modificare i dati.
6. Ripetere su iOS e verificare il ciclo di condivisione/importazione dei file.
7. Eseguire un build nativo con SQLCipher e verificare `PRAGMA cipher_version` su dispositivo.

Non dichiarare il backup certificato fino al completamento di questi test su dispositivi reali.
