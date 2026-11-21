# V9.9 — Diagnostica persistente della build Android

Versione applicativa: **1.0.35**.

## Modifiche

- Il workflow Android serializza le build per branch e non cancella una build già in corso.
- Il timeout del job è portato a 90 minuti.
- Expo Doctor e `expo prebuild` salvano i rispettivi log.
- La configurazione Expo pubblica risolta viene esportata in un file separato.
- Il workflow carica sempre, anche in caso di errore, il progetto Android generato e i log come artifact GitHub Actions (conservazione 7 giorni).

## Avvio

1. Caricare il progetto su GitHub.
2. Configurare `EXPO_TOKEN` in **Settings → Secrets and variables → Actions**.
3. Aprire **Actions → Android preview build → Run workflow**.
4. Attendere il risultato e scaricare l'artifact `spirito-verita-android-prebuild-*` per esaminare i log.

## Gate e limiti

Il workflow richiede un `package-lock.json` validato, un progetto EAS collegato con ID reale, le dipendenze installabili e tutti i gate già presenti. Se uno di questi prerequisiti manca, la build si arresta prima di EAS.

L'artifact del prebuild è una diagnosi del progetto nativo generato: non è un APK e non dimostra che SQLCipher sia stato collaudato su dispositivo. La build EAS resta una fase separata e dipende dalla configurazione del repository e dal secret `EXPO_TOKEN`.
