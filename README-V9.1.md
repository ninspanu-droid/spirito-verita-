# SPIRITO & VERITÀ — V9.1

## Ripristino Diario: controlli più profondi

Questa versione rafforza la validazione dei dati importati e aggiunge test d'integrazione del repository con un database simulato.

### Test

```bash
npm run test:all
```

I test coprono i casi di ripristino valido, diario non vuoto, duplicati, limiti dei campi, date non valide, rollback in caso d'interruzione e controllo di concorrenza simulato.

### Limiti dichiarati

Il database usato nei test è simulato e il servizio di cifratura è sostituito da uno stub. Per questo la suite non certifica la crittografia reale né SQLCipher nativo. Restano necessari installazione dipendenze, typecheck, build EAS e collaudo fisico Android/iOS.
