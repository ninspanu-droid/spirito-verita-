# Verifica migrazione Diario — V5.8

## Scopo

Aggiungere test d'integrazione a livello di orchestrazione per la migrazione da `journal_entries` in chiaro al repository Diario cifrato.

## Casi coperti

- copia e verifica dei contenuti importati;
- conservazione della tabella sorgente;
- seconda esecuzione senza duplicati;
- ripresa dopo un'interruzione simulata;
- conflitto tra ID già presente e contenuto differente;
- rifiuto di una data non valida prima di iniziare la copia;
- comportamento quando la tabella storica non esiste.

## Esecuzione

```bash
npm run test:diary-migration
```

## Limiti espliciti

Questi test usano un database e un repository simulati per verificare il flusso applicativo. Non sostituiscono i test con `expo-sqlite` su Android/iOS, né verificano la cifratura AES-GCM, SecureStore, backup, filesystem o ripristino su dispositivo.

La migrazione conserva deliberatamente `journal_entries` in chiaro. Non rimuovere la tabella né le copie storiche finché non esistono backup verificati, una procedura di recupero e test di ripristino completati.
