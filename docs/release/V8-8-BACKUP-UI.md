# V8.8 — Interfaccia per backup cifrato del Diario

## Funzioni integrate

- Esportazione delle annotazioni decifrate in memoria, poi cifrate con il formato portabile V8.7 e una passphrase scelta dall'utente.
- Conferma della passphrase prima dell'esportazione; i campi sono mascherati e non vengono inviati a servizi remoti.
- Salvataggio temporaneo nella cache dell'app e apertura del foglio nativo di condivisione per permettere all'utente di salvare/inviare il file cifrato.
- Selezione di un file JSON di backup tramite il selettore documenti del sistema.
- Autenticazione e decifratura del file prima di mostrare il numero di annotazioni da ripristinare.
- Conferma esplicita e ripristino soltanto in un Diario vuoto; il repository esegue l'inserimento in transazione e ricifra i contenuti con la chiave locale del dispositivo.
- I pulsanti sono disabilitati quando manca la chiave protetta o è in corso un'altra operazione.

## Dipendenze aggiunte

- `expo-document-picker ~13.1.5`
- `expo-file-system ~18.1.11`
- `expo-sharing ~13.1.5`

Sono versioni previste per la linea Expo SDK 53. Il lockfile non è incluso: deve essere generato in un ambiente con accesso al registry npm e sottoposto a `npm ci`.

## Limiti e avvertenze

- Il backup esportato contiene solo le annotazioni del Diario gestite da `DiaryRepository`; non include impostazioni, progressi, database completo o chiave SQLCipher.
- Il file è cifrato, ma la passphrase è responsabilità dell'utente. Se viene persa, il backup non è recuperabile.
- La condivisione passa dal foglio nativo: l'utente deve scegliere una destinazione affidabile. Non è possibile garantire come le app di destinazione conservino il file.
- Il file temporaneo viene eliminato dalla cache dopo la condivisione; se la condivisione viene annullata, l'utente deve ripetere l'esportazione.
- Il ripristino non fonde dati e non sovrascrive annotazioni: richiede un Diario vuoto. Prima del ripristino va verificato che il backup sia quello desiderato.
- L'importazione legge il file selezionato in memoria; il motore backup impone i limiti dimensionali dichiarati in `diaryBackup.ts`.

## Verifiche

Sono stati aggiunti test statici Node per verificare l'integrazione UI e le dipendenze dichiarate. Questi test non sostituiscono typecheck, test runtime della crittografia, test del file picker/sharing su Android e iOS, né una build nativa.

Prima del rilascio eseguire: installazione dipendenze, generazione e commit del lockfile, `npm ci`, `npm run test:all`, `npm run typecheck`, Expo Doctor e test end-to-end su dispositivi fisici. Verificare anche backup vuoto, passphrase errata, file alterato/troncato, annullamento condivisione/selettore, spazio insufficiente e rollback su errore durante ripristino.
