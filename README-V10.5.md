# SPIRITO & VERITÀ V10.5

Versione applicativa: **1.0.41**.

Questa revisione corregge due aspetti importanti della consegna:
- il controllo anti-token hardcoded usa una regex effettiva e considera sia il workflow Android sia quello iOS;
- il workflow Android usa `set -o pipefail` per Expo Doctor e `expo prebuild`, così `tee` non nasconde gli errori dei comandi.

## Verifica

```bash
npm run test:all
npm run check:handoff
```

`check:handoff` può segnalare prerequisiti mancanti (in particolare lockfile e Project ID EAS). Non genera valori fittizi.

## Passaggio operativo

1. Caricare il contenuto di questa cartella in un repository GitHub.
2. In **Actions**, eseguire **Generate and validate npm lockfile**.
3. Attendere che il workflow termini con successo e integrare la pull request del lockfile.
4. Collegare il progetto Expo con il vero Project ID.
5. Aggiungere `EXPO_TOKEN` in **Settings → Secrets and variables → Actions**.
6. Eseguire **Android preview build**.

Questa versione non contiene un APK già compilato. Il repository GitHub, l'account Expo, il Project ID e il secret non sono collegati da questa sessione; la build EAS e il test SQLCipher su dispositivo restano da eseguire.
