# SPIRITO & VERITÀ V10.4 — Consegna GitHub ed EAS

Versione applicativa: **1.0.40**.

## Nuovo controllo

Eseguire:

```bash
npm run check:handoff
```

Lo script verifica `.gitignore`, protezione di `.env` e `node_modules`, assenza di token hardcoded nei file di configurazione, versioni sincronizzate, identificatori Android/iOS, profilo APK, workflow GitHub, Project ID EAS e lockfile. È bloccante: non crea credenziali, non inventa Project ID e non genera lockfile fittizi.

## Procedura consigliata

1. Estrai il progetto e carica il contenuto della cartella in un nuovo repository GitHub privato.
2. Controlla che `.env`, chiavi, keystore e credenziali non siano nel commit.
3. In GitHub apri **Actions → Generate and validate npm lockfile → Run workflow**.
4. Attendi `npm ci`, test, TypeScript ed Expo Doctor; revisiona e integra la pull request con `package-lock.json`.
5. Crea o seleziona il progetto Expo e collega il vero ID con `eas init` o `npm run set:eas-project`.
6. In GitHub apri **Settings → Secrets and variables → Actions** e crea `EXPO_TOKEN`. Non inserirlo nel codice o in chat.
7. Esegui `npm run check:handoff`, poi avvia **Actions → Android preview build**.
8. Scarica l'APK dalla pagina EAS solo quando la build è completata.

## Stato e limiti

I test locali verificano codice e workflow, non il repository remoto, l'account Expo, i segreti GitHub o una build cloud. Questi passaggi richiedono accesso ai tuoi account e un'azione autorizzata da te. SQLCipher necessita ancora di test nativi su un dispositivo reale.
