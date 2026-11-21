# SPIRITO & VERITÀ V9.9

Versione app: **1.0.35**.

Questa versione migliora la tracciabilità del workflow Android preview: log persistenti per Expo Doctor e prebuild, esportazione della configurazione pubblica Expo, serializzazione delle build e upload dell'artifact diagnostico anche in caso di errore.

Consultare `docs/release/V9-9-ANDROID-WORKFLOW.md` per l'avvio su GitHub Actions.

I test statici del workflow verificano ordine dei gate e presenza degli artifact; non eseguono GitHub Actions, EAS, una compilazione nativa o test su dispositivo.
