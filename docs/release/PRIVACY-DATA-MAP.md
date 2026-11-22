# Mappa dati e privacy — bozza tecnica da verificare

Questa mappa descrive il codice attualmente ricevuto; non è un'informativa legale e va aggiornata dopo audit del codice e test di rete.

| Dato | Dove | Protezione attuale | Azione prima del lancio |
|---|---|---|---|
| Titolo e testo nuove annotazioni Diario | SQLite `diary_entries` | AES-256-GCM applicativo; chiave SecureStore | Audit crittografico, test perdita chiave e backup |
| Tipo e date Diario | SQLite `diary_entries` | Metadati non cifrati | Valutare minimizzazione/cifratura integrale |
| Vecchia nota | AsyncStorage | Non cifrata fino a migrazione | Migrazione verificata; mantenere avviso e copia solo finché necessario |
| Catalogo, preferiti, progressi | SQLite | Database locale non cifrato | Valutare sensibilità e retention |
| Preferenze | Da verificare nel codice completo | Non definita qui | Inventario effettivo |
| Dati account/cloud | Non implementati nel progetto ricevuto | N/A | Non dichiarare sync o account nella scheda store |

## Domande da risolvere dal titolare

- Identità e contatti del titolare del trattamento.
- Finalità e base giuridica per ogni trattamento.
- Tempi di conservazione e procedura per esercizio diritti.
- Uso di crash reporting, analytics, pubblicità, pagamenti o SDK terzi (se introdotti).
- Backup iCloud/Android e relative implicazioni per dati locali e chiavi.
- Eventuale trattamento di dati che possono rivelare convinzioni religiose: minimizzare, evitare profilazione e condivisione; ottenere consulenza privacy specifica prima di qualsiasi servizio cloud/community.

Non compilare le etichette privacy degli store finché la mappa non è stata verificata sul binario finale.
