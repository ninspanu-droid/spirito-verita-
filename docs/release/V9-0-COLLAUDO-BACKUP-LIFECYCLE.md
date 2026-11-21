# V9.0 — Ciclo di vita del backup e pulizia best-effort

Versione app: `1.0.26`.

## Modifiche

- I buffer mutabili contenenti la chiave derivata e il testo in chiaro vengono azzerati con `Uint8Array.fill(0)` in blocchi `finally`, sia durante la creazione sia durante l'apertura del backup.
- La pulizia è best-effort: JavaScript può mantenere copie interne, stringhe immutabili o buffer temporanei che l'app non può azzerare in modo garantito.
- Le passphrase nei campi React Native vengono svuotate al termine dei tentativi di esportazione/importazione, anche in caso di errore.
- Lo stato UI resta occupato durante la fase di ripristino confermata, evitando che la schermata accetti un'altra operazione mentre il repository sta scrivendo.
- Il repository continua a ricontrollare, dentro la transazione, che il Diario sia vuoto prima dell'inserimento.

## Test eseguibili in questo pacchetto

```bash
npm run test:all
```

I test Node includono controlli statici sul ciclo di vita dei buffer e sullo stato UI. Non equivalgono a test runtime della crittografia né a un collaudo Android/iOS.

## Limiti e verifiche ancora necessarie

- `fill(0)` non garantisce la cancellazione di copie create dal runtime JavaScript o dalle librerie crittografiche.
- Non è stato eseguito un typecheck Expo perché il lockfile e le dipendenze installate non sono disponibili in questo ambiente.
- Non è stata eseguita una build nativa né un test di trasferimento/ripristino su due dispositivi.
- Prima della distribuzione occorre collaudare passphrase errata, file alterato, backup valido, diario non vuoto, interruzione durante il ripristino e comportamento del file picker su Android e iOS.
