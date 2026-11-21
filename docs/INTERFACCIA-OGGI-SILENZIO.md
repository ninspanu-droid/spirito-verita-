# Interfaccia Oggi e Silenzio

## Modifiche
- `app/(tabs)/index.tsx`: home con testata, meditazione del giorno, quattro accessi rapidi e invito al silenzio.
- `app/silenzio.tsx`: timer contemplativo con preset 5/10/15/20/30 minuti, start/pause/reset e tre passaggi di preghiera guidata.
- `app/_layout.tsx`: registrazione della route `silenzio`.

## Note tecniche e verifiche necessarie
Il timer usa un intervallo JavaScript attivo mentre la schermata è montata. Non è un timer affidabile in background: se l'app viene sospesa dal sistema, il conteggio può fermarsi o risultare impreciso. Per una futura versione si dovrà calcolare il tempo residuo da un timestamp e gestire il ritorno in foreground; notifiche locali solo dopo consenso esplicito.

Prima del rilascio: `npm install`, `npm run typecheck`, avvio Expo su Android/iOS, test pausa/ripresa, cambio preset, uscita e rientro dalla schermata, modalità risparmio energetico e accessibilità.
