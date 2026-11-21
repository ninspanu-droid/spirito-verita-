# V8.0 — Preparazione della prima build EAS con attesa del risultato

Versione applicazione: `1.0.16`.

## Obiettivo

La V8.0 rende meno ambiguo l'esito dei workflow di anteprima: i job Android e iOS invocano EAS con `--wait`, così il job GitHub resta in esecuzione fino al completamento remoto della build invece di terminare subito dopo l'invio della richiesta.

## Modifiche

- Workflow Android e iOS di anteprima conservati su `workflow_dispatch` (avvio manuale).
- Entrambi richiedono `EXPO_TOKEN` e mantengono i controlli di configurazione, dipendenze, test e collegamento EAS già presenti.
- Entrambi usano `--non-interactive --wait` per attendere l'esito remoto.
- Versione allineata in `package.json` e `app.json`: `1.0.16`.
- Aggiunti test statici per la modalità di attesa e l'avvio manuale.

## Procedura dopo il caricamento su GitHub

1. Verificare che `package-lock.json` sia stato generato e revisionato, poi committarlo nel repository.
2. Collegare il progetto Expo con `npx eas-cli@latest login` e `npx eas-cli@latest init`.
3. Verificare che `app.json` contenga il `projectId` reale sotto `expo.extra.eas.projectId`.
4. Aggiungere `EXPO_TOKEN` nei GitHub Actions Secrets.
5. Aprire Actions e avviare manualmente `Android preview build`.
6. Attendere che il job termini: con `--wait`, un job verde indica che EAS ha riportato il completamento della build; controllare comunque il link e il dettaglio della build nel dashboard Expo.

## Limiti e sicurezza

- Questa consegna non esegue una build EAS: il repository, il `projectId` e il secret sono esterni a questo ambiente.
- Non è stato generato né inventato un `package-lock.json`.
- Il workflow iOS resta manuale; l'esecuzione su runner Ubuntu non equivale al test dell'app su un iPhone.
- La presenza di `useSQLCipher: true` e i test statici non dimostrano che il database nativo sia cifrato nel binario. Occorre una build custom, test su dispositivo e verifica `PRAGMA cipher_version`/lettura autenticata.
- Non cancellare il database legacy in chiaro finché migrazione, conteggi, riapertura, ripristino e approvazione esplicita non sono stati verificati.
