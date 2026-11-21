# V8.5 — Sicurezza e manutenzione delle dipendenze

## Modifiche

- Aggiunto Dependabot per aggiornamenti settimanali delle dipendenze npm e delle GitHub Actions.
- Aggiunto workflow `Dependency security audit`, eseguito su pull request, push su `main`/`master`, ogni lunedì e manualmente.
- Il workflow richiede un `package-lock.json` committato, esegue `npm ci` e poi `npm audit --audit-level=high`.
- Il workflow ha permessi GitHub in sola lettura (`contents: read`).
- Versione app/package: `1.0.21`.

## Verifiche locali

Eseguire `node --test tests/*.test.cjs`. I test statici verificano che configurazione Dependabot e workflow contengano i controlli previsti; non eseguono il workflow GitHub né interrogano il registro npm.

## Limiti e prossimi passi

- Il workflow di audit remoto non è stato eseguito in questa preparazione.
- L'audit dipende dal lockfile: se `package-lock.json` manca, il job si arresta intenzionalmente prima dell'installazione.
- Non sono stati aggiornati automaticamente pacchetti né creato un lockfile non verificato.
- Build EAS e verifica SQLCipher nativa su dispositivo restano da eseguire.
