# Audit tecnico e stato di preparazione al lancio

**Data:** 22 novembre 2026  
**Repository:** `ninspanu-droid/spirito-verita-`  
**Commit di riferimento:** `9891d59b36f924fcb47f6662887a4affa7ea14f4`  
**Esito:** build Android di test verificata; rilascio pubblico non autorizzato.

## 1. Perimetro e metodo

È stato inventariato l'albero del repository e sono stati esaminati i file di configurazione, il workflow Android, le schermate principali, il bootstrap SQLCipher, la migrazione SQLite legacy, il codice del Diario, i test e i documenti di rilascio. Questo è un audit tecnico statico e di CI sui percorsi critici; non equivale a una revisione riga per riga certificata, a un penetration test o a un collaudo su ogni dispositivo.

File/aree esaminati in dettaglio:
- `package.json`, `package-lock.json`, `app.json`, `eas.json`, `tsconfig.json`;
- `.github/workflows/android-apk-one-click.yml`;
- `app/_layout.tsx`, navigazione tab, Oggi, Parola, Preghiera, Adorazione, Profilo, Catalogo, Silenzio e route modulo;
- `components/DatabaseStartupBoundary.tsx`;
- `database/secureDatabase.ts`, `database/sqlCipherKey.ts`, `database/database.ts`, gate e audit privacy;
- `src/diary/*`, migrazioni legacy e backup;
- `tests/*`, `scripts/*`, documentazione di privacy, test e lancio.

## 2. Risultati positivi verificati

- La correzione Android SecureStore è presente: `spirito-verita.sqlcipher.key.v1` usa solo caratteri ammessi dal formato verificato nel test.
- Il bootstrap controlla la disponibilità di SQLCipher prima di procedere, applica la chiave e forza una lettura autenticata prima di esporre il database all'app.
- La generazione della chiave è conservativa: una chiave mancante non deve essere rigenerata per un database cifrato già popolato.
- La migrazione da `spirito-verita.db` copia moduli, preferiti, progressi e annotazioni storiche nel database protetto, verifica i record copiati e non cancella il database sorgente.
- Il Diario cifra titolo e testo con AES-256-GCM e include backup cifrato con passphrase; il ripristino è limitato a un diario vuoto per evitare sovrascritture.
- Run 59 (22 novembre 2026) ha concluso con successo: test applicativi selezionati, test focalizzati SQLCipher, TypeScript, Expo Doctor, build Android autonoma, controllo bundle JS/firma e installazione/avvio su emulatore API 35.
- La PR #11 è stata integrata in `main` nel commit `9891d59b36f924fcb47f6662887a4affa7ea14f4`.

## 3. Rilievi e blocchi

### P0 — contenuti non completi

`data/moduleSeed.ts` contiene 301 record: **8 ready e 293 draft**. La maggioranza è costituita da segnaposto “contenuto da integrare”. Il catalogo funzionale non equivale a un prodotto editoriale completo. Non è corretto promuovere 301 moduli come contenuti finiti.

Azione necessaria: completamento editoriale, revisione teologica/linguistica, attribuzione delle fonti e verifica dei diritti prima di cambiare lo stato dei record.

### P0 — collaudo su dispositivo reale mancante

Run 59 usa un emulatore Android API 35. Non è stata dimostrata l'apertura sul Samsung A16 con Android 17, né il comportamento su altri modelli/OEM, né il ciclo aggiornamento da una precedente installazione contenente dati reali.

Azione necessaria: installare l'APK verificata sul dispositivo senza disinstallare la versione esistente e senza cancellare dati; verificare avvio, Diario, preferiti, progressi, riavvio e diagnostica SQLCipher.

### P0 — firma e distribuzione

L'APK del workflow locale è firmata con la debug key generata dal template Android. È un artefatto installabile per test, non la firma di produzione del titolare e non un pacchetto pronto per Google Play.

Azione necessaria: configurare credenziali di release sotto il controllo del titolare, proteggere keystore e password fuori dal repository/chat, generare AAB/APK di produzione e verificare upgrade/signing.

### P1 — piattaforma Android/Expo

Il progetto usa Expo SDK 53 / React Native 0.79.6. Il workflow attuale installa `platforms;android-35`, build-tools 35.0.0 e usa un emulatore API 35. Questi dati provano il collaudo su API 35, non la conformità al livello API richiesto al momento della pubblicazione.

Azione necessaria: migrazione Expo controllata verso una versione supportata al momento del rilascio; controllare il target SDK generato effettivo, compile SDK, Gradle, NDK, plugin SQLCipher e requisiti Google Play. Eseguire una major per volta quando richiesto, senza cambiare contemporaneamente il formato o la chiave del database.

### P1 — test CI non equivalenti a tutta la suite

Il workflow esclude esplicitamente diversi test statici legacy/fixture e poi esegue una selezione dei test rimanenti più due gruppi SQLCipher. Il successo Run 59 è reale ma non deve essere descritto come esecuzione indistinta di `npm run test:all` sull'intero repository.

Azione necessaria: classificare i test esclusi, aggiornarli o rimuoverli con motivazione, e introdurre un gate CI chiaro che esegua la suite mantenuta completa.

### P1 — privacy, recupero e migrazione

Il database principale è configurato per SQLCipher e il Diario applica ulteriore cifratura ai contenuti. Resta importante documentare:
- permanenza della copia legacy non cifrata `spirito-verita.db` e condizioni per la sua eventuale rimozione futura;
- gestione della chiave locale, perdita dispositivo, reinstallazione e impossibilità di recupero senza chiave/backup;
- passphrase del backup, esportazione, condivisione e conservazione sicura;
- metadati, log, file temporanei, WAL e copie di backup;
- cancellazione logica e limiti della cancellazione fisica.

Non cancellare automaticamente il database legacy o rigenerare chiavi: serve una procedura di migrazione con backup verificato, confronto dati e approvazione esplicita.

### P1 — completezza del prodotto

Le schermate Parola, Preghiera e Adorazione contengono spunti testuali locali; non risulta un sistema editoriale remoto, account, sincronizzazione, audio streaming o backend. La modalità Silenzio non va presentata come timer con notifica garantita a app terminata.

Azione necessaria: decidere cosa fa parte della prima release offline e implementare solo funzioni realmente testate.

### P1 — identità, asset e obblighi store

La configurazione esaminata non mostra un set completo di asset finali (icona/screenshot store) né prova di una privacy policy pubblica, contatti supporto, titolare del trattamento, classificazione età, Data Safety e Privacy Labels approvati.

Azione necessaria: ottenere i dati dal titolare e preparare asset e dichiarazioni corrispondenti al comportamento reale dell'app. Non inventare identità legali, indirizzi, licenze o policy.

## 4. Matrice di stato

| Area | Stato | Evidenza / prossimo passo |
|---|---|---|
| Fix SecureStore Android | Verificato in CI | Test regressione + Run 59 |
| Bootstrap SQLCipher | Testato in CI/emulatore | Serve collaudo dispositivo e aggiornamento con dati reali |
| Migrazione DB legacy | Test automatizzati presenti | Prova su copia di dati reali e backup verificato |
| Diario AES-GCM | Implementato nel sorgente | Audit indipendente e test perdita chiave/restore |
| Backup cifrato Diario | Implementato nel sorgente | Test manuale end-to-end su due installazioni compatibili |
| Schermate e navigazione | Presenti nel sorgente | QA UX/accessibilità su telefoni |
| Catalogo | 8 ready / 293 draft | Completamento editoriale |
| Build APK debug | Run 59 success | Non è firma di produzione |
| Samsung A16 Android 17 | Non verificato | Installazione e test fisico |
| iOS | Non verificato | Build e test su iPhone |
| Conformità store | Non verificata | Migrazione SDK/target API e checklist store |
| Privacy e diritti contenuti | Non completati | Documentazione legale e licenze |

## 5. Sequenza raccomandata, senza rischiare i dati

1. Conservare la build Run 59 e un backup cifrato verificato.
2. Provare la build sul Samsung A16 senza disinstallare l'app e senza cancellare i dati; raccogliere solo log privi di contenuti personali.
3. Stabilizzare il comportamento del database e i test di migrazione/backup.
4. Aggiornare Expo/Android in un ramo separato, una famiglia di dipendenze alla volta; mantenere invariati nome DB, algoritmo, chiave e procedura di migrazione.
5. Completare i contenuti e le licenze, poi privacy, asset, supporto e schede store.
6. Generare build di release con firma di produzione e fare beta test Android/iOS.
7. Pubblicare soltanto dopo il superamento di tutti i gate.

## 6. Regole di sicurezza per ogni modifica futura

- Non cancellare `spirito-verita.db`, `spirito-verita-secure.db`, tabelle, file WAL o preferenze per “riparare” un avvio.
- Non cambiare il nome della chiave SQLCipher una seconda volta senza una migrazione compatibile.
- Non generare una nuova chiave se il database protetto contiene già dati.
- Non disabilitare SQLCipher e non degradare silenziosamente a SQLite in chiaro.
- Non dichiarare superato un test su dispositivo fisico sulla base di un emulatore.
- Non chiamare “release Play Store” un APK firmato con debug key.
