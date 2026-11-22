# SPIRITO & VERITÀ

**Adorare con tutto il cuore** — applicazione mobile in sviluppo per preghiera, meditazione, adorazione, percorsi e diario personale.

> **Stato al 22 novembre 2026: build Android installabile verificata su emulatore; progetto non ancora pronto per la pubblicazione sugli store.** La verifica su emulatore non sostituisce il collaudo sul Samsung A16 o su altri dispositivi fisici.

## Stato tecnico

- Expo SDK 53, Expo Router 5, React Native 0.79.6 e TypeScript.
- Versione app: `1.0.42`; package Android: `it.spiritoeverita.app`.
- Database applicativo: SQLite con SQLCipher abilitato nella configurazione nativa.
- Chiave SQLCipher conservata localmente in Android SecureStore.
- Diario: contenuti del diario cifrati a livello applicativo AES-256-GCM; backup cifrato con passphrase.
- Nessun backend, account o sincronizzazione cloud documentati nel prodotto attuale.

## Funzioni presenti nel sorgente

- Schede Oggi, Parola, Preghiera, Adorazione e Profilo.
- Catalogo locale con ricerca, categorie, preferiti e avanzamento.
- Modalità Silenzio con timer.
- Diario spirituale con annotazioni, importazione dati legacy e backup/ripristino cifrato.
- Controllo diagnostico locale SQLCipher e integrità database.

### Contenuti del catalogo

Il catalogo contiene 301 record, ma soltanto **8 risultano marcati `ready` e 293 sono bozze/segnaposto**. Non presentare il catalogo come 301 percorsi editoriali completi finché i contenuti non sono stati scritti, revisionati e autorizzati.

## Avvio in sviluppo

Requisiti: Node.js LTS e npm.

```bash
npm ci
npm run start
```

Comandi utili:

```bash
npm run typecheck
npm run test:all
npm run test:sqlcipher-bootstrap
npm run test:sqlcipher-key
npx expo-doctor
```

SQLCipher richiede una build nativa personalizzata: Expo Go non è sufficiente per verificare il database cifrato.

## Dati locali: precauzioni importanti

- Non disinstallare l'app, non usare “Cancella dati/archiviazione” e non cancellare i database per tentare di risolvere errori.
- Il database legacy `spirito-verita.db` viene letto e copiato nel database SQLCipher; il codice di migrazione non elimina la sorgente.
- Non sostituire o rigenerare manualmente la chiave SecureStore. Un database cifrato esistente senza la sua chiave deve fallire in modo conservativo.
- Prima di migrazioni o ripristini, verificare un backup cifrato e conservarne la passphrase separatamente.

## Build Android verificata

La GitHub Actions **Run 59** è terminata con successo. Ha eseguito test selezionati, typecheck, Expo Doctor, build APK autonoma, verifica della firma e smoke test di installazione/avvio su emulatore Android API 35.

- [Build Run 59](https://github.com/ninspanu-droid/spirito-verita-/actions/runs/45061037664)
- Artifact: `spirito-verita-android-apk-59-VERIFIED`
- La build locale usa la chiave debug generata dal template Android: è installabile per test, **non è una firma di produzione per Google Play**.
- Il test su emulatore non certifica il funzionamento su Samsung A16 né su tutti i dispositivi Android.

## Blocchi prima del lancio pubblico

1. Migrare Expo SDK 53 e riallineare le dipendenze/native toolchain in un ramo dedicato, con test di regressione SQLCipher e dei dati esistenti.
2. Verificare target/compile SDK Android richiesti al momento dell'invio. Il workflow di test attuale installa componenti Android 35 e usa un emulatore API 35: questo non dimostra da solo la conformità a un target API successivo.
3. Eseguire test fisici Android (incluso Samsung A16) e iOS.
4. Completare e revisionare i 293 moduli in bozza; verificare licenze di traduzioni bibliche, testi, musica, audio e immagini.
5. Completare informativa privacy, titolare del trattamento, contatti supporto, Data Safety/Privacy Labels e schede store.
6. Preparare icone, screenshot reali, credenziali e firma di produzione del titolare.
7. Verificare backup, ripristino, migrazione legacy, perdita chiave e aggiornamento da versioni installate.

Il piano dettagliato e la matrice dei controlli sono in [docs/AUDIT-TECNICO-COMPLETO-2026-11-22.md](docs/AUDIT-TECNICO-COMPLETO-2026-11-22.md) e [docs/release/PIANO-LANCIO.md](docs/release/PIANO-LANCIO.md).

## Repository

https://github.com/ninspanu-droid/spirito-verita-
