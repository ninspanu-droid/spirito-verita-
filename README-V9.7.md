# SPIRITO & VERITÀ — V9.7

Versione applicativa: **1.0.33**.

La V9.7 non dichiara risolto il blocco del lockfile. Aggiunge una guida operativa per eseguire la generazione e la validazione in GitHub Actions, dove il runner può raggiungere il registry npm anche se l'ambiente locale ha avuto timeout.

## Procedura

1. Caricare il contenuto del progetto in un repository GitHub.
2. Verificare che il branch predefinito sia aggiornato e che GitHub Actions sia abilitato.
3. Aprire **Actions → Generate and validate npm lockfile → Run workflow**.
4. Attendere la generazione del lockfile, `npm ci`, i test, TypeScript ed Expo Doctor.
5. Se tutti i controlli riescono, esaminare l'artifact e la pull request automatica `automation/validated-npm-lockfile`.
6. Revisionare il diff e i controlli prima di approvare il merge.
7. Dopo il merge, rilanciare il workflow Android preview solo dopo aver configurato `EXPO_TOKEN` nei repository secrets e verificato il collegamento EAS.

## Garanzie e limiti

- Il workflow di generazione non scrive direttamente sul branch principale: propone una pull request.
- `package-lock.json` è considerato valido solo dopo `npm ci`, test, TypeScript ed Expo Doctor completati con successo.
- Il token EAS non serve per generare il lockfile; serve per le build EAS e non deve essere inserito nei file del progetto.
- I test locali statici non equivalgono a una build nativa né certificano SQLCipher su dispositivo.
- In questa consegna non è stato generato un lockfile: il tentativo npm locale è stato interrotto per timeout.
