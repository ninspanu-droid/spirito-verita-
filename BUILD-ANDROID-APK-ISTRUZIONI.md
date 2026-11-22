# SPIRITO & VERITÀ — generazione APK Android

Questo script prepara le dipendenze, autentica Expo, collega il progetto EAS, esegue i controlli e avvia una build Android APK con il profilo `preview`.

## Requisiti
- Computer con connessione Internet stabile.
- Node.js LTS e npm.
- Account Expo attivo.
- Git consigliato per versionare `package-lock.json` e il Project ID generato.

## Esecuzione
Aprire il terminale nella cartella principale del progetto ed eseguire:

```bash
bash BUILD-ANDROID-APK.sh
```

Lo script richiede l'accesso interattivo a Expo e può chiedere di confermare la creazione/associazione del progetto EAS. Non incollare password o token in chat.

## Risultato
La build viene eseguita sui server EAS. Al termine del comando viene mostrata la pagina della build; l'APK è scaricabile solo quando EAS indica che la build è terminata con successo.

## Nota importante
Il superamento dei test automatici non equivale a un test su dispositivo. Dopo aver scaricato l'APK, installarlo su un dispositivo Android e verificare navigazione, database SQLite/SQLCipher, backup, ripristino e funzioni native. Non dichiarare SQLCipher validato finché questi test non sono stati eseguiti.
