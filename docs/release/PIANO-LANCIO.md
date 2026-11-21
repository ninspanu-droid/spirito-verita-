# Piano di completamento e lancio — SPIRITO & VERITÀ

Stato aggiornato: 17 novembre 2026. Questo documento distingue ciò che è presente nel sorgente da ciò che deve ancora essere verificato o fornito dal titolare dell'app.

## Stato reale della base ricevuta

- Progetto Expo Router / React Native / TypeScript ricevuto come SDK 53.
- Schermate Oggi, Parola, Preghiera, Adorazione, Profilo, Catalogo, Silenzio e Diario presenti nel sorgente.
- Catalogo locale: 301 record, ma la maggior parte sono segnaposto/bozze; non presentarli come 301 contenuti editoriali finiti.
- Diario: titolo e testo cifrati a livello applicativo AES-256-GCM; chiave locale in SecureStore. I metadati e il resto del database SQLite non sono cifrati integralmente.
- Vecchia nota AsyncStorage importabile; la vecchia copia viene conservata.
- Timer aggiornato per ricalcolare il residuo da una scadenza assoluta quando l'app torna in primo piano. Non garantisce notifiche o suono a app terminata.
- Nessun backend, account, sincronizzazione cloud o recupero multi-dispositivo verificato.
- Nessuna build installabile, test dispositivo o invio agli store verificato in questa consegna.

## Gate 0 — proprietario e decisioni di prodotto

- [ ] Confermare titolare del trattamento, nome legale, indirizzo e contatto privacy.
- [ ] Confermare paesi/lingue del lancio (proposta: Italia, italiano).
- [ ] Definire fascia d'età e pubblico; non dichiarare l'app destinata ai minori senza un progetto privacy/sicurezza specifico.
- [ ] Decidere se il primo rilascio è offline-only. Raccomandazione: sì, niente community/account/cloud nel primo rilascio finché non esistono backend, moderazione e policy.
- [ ] Approvare contenuti, traduzione biblica, citazioni, immagini e audio con prova delle licenze.

## Gate 1 — aggiornamento piattaforma obbligatorio

Il progetto è su Expo SDK 53. Non inviare questa versione agli store. Al 17 novembre 2026 Expo SDK 58 è la versione stabile più recente risultante dalla documentazione Expo consultata. Pianificare migrazione controllata SDK 53 → SDK 58, una major alla volta se richiesto dalle note di migrazione; riallineare i pacchetti Expo con `npx expo install --fix` e controllare con `npx expo-doctor`.

Google Play richiede per nuove app e aggiornamenti target Android 16 / API 36 dal 31 agosto 2026. Apple richiede upload App Store Connect compilati con Xcode 26 o successivo e SDK iOS 26 o successivo dal 28 aprile 2026. Verificare nuovamente i requisiti al momento dell'invio.

Fonti ufficiali:
- Expo SDK: https://expo.dev/sdk
- Expo SDK 58: https://expo.dev/changelog/sdk-58
- Google Play target API: https://support.google.com/googleplay/android-developer/answer/11926878
- Apple upcoming requirements: https://developer.apple.com/news/upcoming-requirements/

## Gate 2 — sicurezza e privacy

- [ ] Revisione indipendente della cifratura e gestione chiave; decidere e documentare cosa accade con perdita dispositivo, reinstallazione e backup.
- [ ] Valutare SQLCipher o altra cifratura integrale del database se si conservano metadati personali; altrimenti minimizzare e documentare il rischio.
- [ ] Testare migrazione vecchia nota, ripetizione, conflitto, chiave assente, chiave corrotta, reinstallazione, backup/restore.
- [ ] Evitare testo di preghiere/diario nelle notifiche lock-screen e nei log/analytics.
- [ ] Implementare cancellazione dati e spiegare limiti tecnici di WAL/backup; non promettere cancellazione forense.
- [ ] Redigere informativa GDPR, base giuridica, finalità, retention, diritti, contatti, eventuali responsabili e trasferimenti.
- [ ] Completare Data Safety Google Play e App Privacy Apple sulla base del comportamento effettivo, non di dichiarazioni desiderate.
- [ ] Nessun account o dato inviato a terzi nel primo rilascio, salvo che venga realmente implementato e dichiarato.

## Gate 3 — qualità e accessibilità

- [ ] `npm ci` (dopo aver generato e revisionato lockfile) e `npm run typecheck` senza errori.
- [ ] `npx expo-doctor` senza problemi bloccanti.
- [ ] Test Android fisico e iPhone fisico, almeno un dispositivo piccolo e uno grande.
- [ ] Test: primo avvio, aggiornamento, offline, perdita rete, riavvio, cambio tema/lingua se implementati, orientamento, safe area, tastiera.
- [ ] Test Diario: creazione, lettura, cancellazione, chiave, migrazione, backup e ripristino.
- [ ] Test timer: avvio, pausa, ripresa, reset, cambio preset, app in background, sospensione e ritorno.
- [ ] Test VoiceOver/TalkBack, dimensione caratteri, contrasto, target touch, riduzione animazioni.
- [ ] Test performance, crash, memoria e dimensione bundle.

## Gate 4 — contenuti e diritti

- [ ] Completare e revisionare editorialmente i contenuti; distinguere bozze da pubblicati.
- [ ] Acquisire autorizzazioni per traduzioni bibliche, testi, musica, registrazioni vocali, fotografie e illustrazioni.
- [ ] Attribuire correttamente fonti e licenze; archiviare i contratti.
- [ ] Se non ci sono licenze per una traduzione, usare riferimenti e contenuti originali autorizzati, non riprodurre testi protetti.

## Gate 5 — identità e schede store

- [ ] Scegliere identificativi univoci `ios.bundleIdentifier` e `android.package` (dominio controllato dal titolare).
- [ ] Preparare icona app definitiva, splash, screenshot reali dalle build e banner promozionali nei formati richiesti dagli store.
- [ ] Verificare che screenshot e descrizione mostrino funzioni effettivamente presenti, non mockup di funzioni non implementate.
- [ ] Inserire URL pubblica dell'informativa privacy e contatti supporto.
- [ ] Compilare classificazione età, categorie, dichiarazioni contenuti, privacy labels e Data Safety.

## Gate 6 — beta e rilascio

- [ ] Configurare account Apple Developer e Google Play Console del titolare.
- [ ] Configurare EAS, progetto Expo, credenziali e signing; non condividere password o chiavi private in chat.
- [ ] Build interna Android/iOS; distribuire a tester; raccogliere crash e feedback.
- [ ] Risolvere bug bloccanti e ripetere test di regressione.
- [ ] Inviare a revisione sugli store; rispondere alle richieste di chiarimento.
- [ ] Pubblicare gradualmente; monitorare crash, recensioni, supporto e richieste privacy.
- [ ] Predisporre processo per aggiornamenti, incidenti, revoca contenuti/licenze e risposta alle vulnerabilità.

## Criterio di via libera

Il lancio è autorizzato solo quando tutti i gate obbligatori sono chiusi, le build firmate sono state installate e testate, i contenuti sono autorizzati, la privacy è corretta e le schede store corrispondono all'app reale. La creazione di un archivio ZIP non equivale a una build o a una pubblicazione.
