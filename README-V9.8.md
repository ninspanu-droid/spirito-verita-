# SPIRITO & VERITÀ — V9.8

Versione applicativa **1.0.34**.

La V9.8 rafforza i controlli CI prima della build Android: compatibilità dipendenze Expo, Expo Doctor e generazione del progetto nativo Android tramite prebuild. Il prebuild non è una compilazione e non certifica SQLCipher a runtime.

Per la build EAS servono ancora lockfile generato e verificato, `npm ci`, progetto EAS collegato con ID reale e secret `EXPO_TOKEN`.
