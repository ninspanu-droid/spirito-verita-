import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import type { DiaryEntry, DiaryEntryType } from "./types";
import { DiaryRepository } from "./diaryRepository";
import { hasDiaryKey, initializeDiaryKey } from "./crypto";
import { migrateLegacyDiary } from "./legacyMigration";
import { LegacyAsyncStorageDiarySource } from "./legacyAsyncStorageSource";
import { auditDiaryStorage, type PrivacyAuditResult } from "../../database/privacyAudit";
import { migrateLegacySqliteJournal } from "./legacySqliteMigration";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { createEncryptedDiaryBackup, openEncryptedDiaryBackup } from "./diaryBackup";

const COLORS = {
  background: "#F5F1E8",
  ivory: "#F5F1E8",
  surface: "#FFFFFF",
  green: "#192B29",
  gold: "#E7D8B9",
  muted: "#77766F",
  line: "#E4DED2",
};

const TYPES: { value: DiaryEntryType; label: string }[] = [
  { value: "prayer", label: "Preghiera" },
  { value: "intention", label: "Intenzione" },
  { value: "gratitude", label: "Gratitudine" },
  { value: "reflection", label: "Riflessione" },
];

export default function DiaryScreen() {
  const db = useSQLiteContext();
  const repository = useMemo(() => new DiaryRepository(db), [db]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [type, setType] = useState<DiaryEntryType>("prayer");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyAvailable, setKeyAvailable] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [activatingKey, setActivatingKey] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const [restoreConfirmationPending, setRestoreConfirmationPending] = useState(false);
  const [exportPassphrase, setExportPassphrase] = useState("");
  const [exportPassphraseConfirm, setExportPassphraseConfirm] = useState("");
  const [importPassphrase, setImportPassphrase] = useState("");
  const [privacyAudit, setPrivacyAudit] = useState<PrivacyAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await repository.getAll();
    setEntries(result);
  }, [repository, db]);

  useEffect(() => {
    let active = true;
    repository.initialize()
      .then(async () => {
        const [available, audit] = await Promise.all([
          hasDiaryKey(),
          auditDiaryStorage(db),
        ]);
        if (active) { setKeyAvailable(available); setPrivacyAudit(audit); setReady(true); }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Errore inizializzazione diario.");
      });
    return () => { active = false; };
  }, [repository]);

  useEffect(() => {
    if (!ready) return;
    refresh().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Impossibile leggere il diario.");
    });
  }, [ready, refresh]);

  async function activateProtectedDiary() {
    if (activatingKey) return;
    setActivatingKey(true);
    try {
      const keyExists = await hasDiaryKey();
      const recordsExist = await repository.hasRecords();
      if (!keyExists && recordsExist) {
        throw new Error("Esistono annotazioni cifrate ma la chiave non è presente. Non crearne una nuova: occorre prima valutare il recupero della chiave.");
      }
      await initializeDiaryKey();
      setKeyAvailable(true);
      setError(null);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile inizializzare la protezione.");
    } finally {
      setActivatingKey(false);
    }
  }

  async function importLegacyNote() {
    if (!keyAvailable) {
      setError("Attiva prima la chiave protetta del diario.");
      return;
    }
    setMigrating(true);
    setError(null);
    try {
      const result = await migrateLegacyDiary(
        repository,
        new LegacyAsyncStorageDiarySource()
      );
      await refresh();
      Alert.alert(
        "Importazione completata",
        result.sourceEntries === 0
          ? "Non è stata trovata una vecchia nota da importare."
          : `Nota importata e verificata. Record nuovi: ${result.inserted}. La vecchia copia è stata conservata su questo dispositivo.`
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Importazione della vecchia nota non riuscita.");
    } finally {
      setMigrating(false);
    }
  }

  async function importLegacySqliteJournal() {
    if (!keyAvailable) {
      setError("Attiva prima la chiave protetta del diario.");
      return;
    }
    setMigrating(true);
    setError(null);
    try {
      const result = await migrateLegacySqliteJournal(db, repository);
      await refresh();
      const message = !result.tableFound
        ? "Non è stato trovato un archivio SQLite storico."
        : `Verifica completata: ${result.verified} annotazioni copiate e decifrate correttamente. Le vecchie copie in chiaro sono state conservate.`;
      Alert.alert("Migrazione archivio storico", message);
      setPrivacyAudit(await auditDiaryStorage(db));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Migrazione SQLite non riuscita.");
    } finally {
      setMigrating(false);
    }
  }

  async function exportEncryptedBackup() {
    if (!keyAvailable) {
      setError("Attiva prima la chiave protetta del diario.");
      return;
    }
    if (exportPassphrase.length < 12) {
      setError("La passphrase del backup deve contenere almeno 12 caratteri.");
      return;
    }
    if (exportPassphrase !== exportPassphraseConfirm) {
      setError("Le due passphrase non coincidono.");
      return;
    }
    if (backupBusy) return;
    setBackupBusy(true);
    setError(null);
    let backupUri: string | null = null;
    try {
      const allEntries = await repository.getAll();
      const serialized = await createEncryptedDiaryBackup(allEntries, exportPassphrase);
      if (!FileSystem.cacheDirectory) throw new Error("Cartella temporanea non disponibile su questo dispositivo.");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      backupUri = `${FileSystem.cacheDirectory}spirito-verita-diario-${stamp}.svbackup`;
      await FileSystem.writeAsStringAsync(backupUri, serialized, { encoding: FileSystem.EncodingType.UTF8 });
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) throw new Error("La condivisione file non è disponibile su questo dispositivo.");
      await Sharing.shareAsync(backupUri, {
        mimeType: "application/json",
        dialogTitle: "Salva il backup cifrato del Diario",
        UTI: "public.json",
      });
      Alert.alert("Backup preparato", "Il file cifrato è stato passato al sistema di condivisione. Conserva separatamente la passphrase: senza di essa il backup non è recuperabile.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Esportazione del backup non riuscita.");
    } finally {
      setExportPassphrase("");
      setExportPassphraseConfirm("");
      if (backupUri) {
        try { await FileSystem.deleteAsync(backupUri, { idempotent: true }); } catch { /* La cache verrà ripulita dal sistema. */ }
      }
      setBackupBusy(false);
    }
  }

  async function importEncryptedBackup() {
    if (!keyAvailable) {
      setError("Attiva prima la chiave protetta del diario.");
      return;
    }
    if (importPassphrase.length < 12) {
      setError("Inserisci la passphrase usata per creare il backup (almeno 12 caratteri).");
      return;
    }
    if (backupBusy) return;
    setBackupBusy(true);
    setError(null);
    try {
      if (await repository.hasRecords()) {
        throw new Error("Il Diario contiene già annotazioni. Per sicurezza il ripristino è disponibile solo su un archivio vuoto; non verranno sovrascritti dati.");
      }
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "public.json"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled || !picked.assets?.[0]) {
        setImportPassphrase("");
        return;
      }
      const selectedFile = picked.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
      const maximumBackupFileBytes = 20 * 1024 * 1024;
      if (!fileInfo.exists || fileInfo.isDirectory || typeof fileInfo.size !== "number" || fileInfo.size < 1 || fileInfo.size > maximumBackupFileBytes) {
        throw new Error("Il file selezionato non è valido oppure supera il limite di 20 MB.");
      }
      if (typeof selectedFile.size === "number" && selectedFile.size > maximumBackupFileBytes) {
        throw new Error("Il file selezionato supera il limite di 20 MB.");
      }
      const serialized = await FileSystem.readAsStringAsync(selectedFile.uri, { encoding: FileSystem.EncodingType.UTF8 });
      const restoredEntries = await openEncryptedDiaryBackup(serialized, importPassphrase);
      setImportPassphrase("");
      let restoreStarted = false;
      setRestoreConfirmationPending(true);
      Alert.alert(
        "Conferma ripristino",
        `Il backup contiene ${restoredEntries.length} annotazioni. Verranno aggiunte al Diario vuoto di questo dispositivo. Continuare?`,
        [
          { text: "Annulla", style: "cancel", onPress: () => setRestoreConfirmationPending(false) },
          {
            text: "Ripristina",
            onPress: () => {
              restoreStarted = true;
              setRestoreConfirmationPending(false);
              void (async () => {
                setBackupBusy(true);
                try {
                  // Recheck empty state inside the repository transaction before any row is written.
                  const count = await repository.restoreFromBackup(restoredEntries);
                  await refresh();
                  Alert.alert("Ripristino completato", `${count} annotazioni ripristinate e cifrate con la chiave locale di questo dispositivo.`);
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "Ripristino del backup non riuscito.");
                } finally {
                  setImportPassphrase("");
                  setBackupBusy(false);
                }
              })();
            },
          },
        ],
        { cancelable: true, onDismiss: () => { if (!restoreStarted) setRestoreConfirmationPending(false); } }
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Importazione del backup non riuscita.");
    } finally {
      setImportPassphrase("");
      setBackupBusy(false);
    }
  }

  async function saveEntry() {
    if (!keyAvailable) {
      setError("Attiva prima la chiave protetta del diario.");
      return;
    }
    if (!title.trim() && !body.trim()) {
      setError("Scrivi un titolo o il contenuto della tua annotazione.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await repository.save({
        type,
        title: title.trim(),
        body: body.trim(),
      });
      setTitle("");
      setBody("");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile salvare l'annotazione.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(entry: DiaryEntry) {
    Alert.alert(
      "Eliminare l'annotazione?",
      "L'annotazione verrà rimossa dal database locale dell'app. Le copie di backup o del filesystem potrebbero persistere.",
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => {
            try {
              await repository.delete(entry.id);
              await refresh();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Impossibile eliminare l'annotazione.");
            }
          },
        },
      ]
    );
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.center}>
        {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator color={COLORS.green} />}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>IL TUO SPAZIO PERSONALE</Text>
            <Text style={styles.heading}>Diario spirituale</Text>
            <Text style={styles.subtitle}>Un luogo riservato per pregare, ricordare e riflettere.</Text>
            <View style={styles.securityCard}>
              <Text style={styles.securityTitle}>Protezione del diario</Text>
              <Text style={styles.securityText}>{keyAvailable ? "Chiave protetta presente sul dispositivo. Titoli e testi delle nuove annotazioni vengono cifrati prima del salvataggio." : "Attiva la chiave protetta prima di salvare o importare annotazioni. La chiave resta sul dispositivo."}</Text>
              <Text style={styles.recoveryWarning} accessibilityRole="text">
                Il backup è cifrato con una passphrase scelta da te. Conservala separatamente: se la perdi, il file non può essere recuperato. Il ripristino è consentito solo in un Diario vuoto e non sostituisce il backup del database locale.
              </Text>
              <Text style={styles.backupLabel}>Crea backup cifrato</Text>
              <TextInput value={exportPassphrase} onChangeText={setExportPassphrase} placeholder="Passphrase (minimo 12 caratteri)" placeholderTextColor={COLORS.muted} style={styles.backupInput} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword" />
              <TextInput value={exportPassphraseConfirm} onChangeText={setExportPassphraseConfirm} placeholder="Ripeti la passphrase" placeholderTextColor={COLORS.muted} style={styles.backupInput} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword" />
              <Pressable style={[styles.secondaryButton, (!keyAvailable || backupBusy || restoreConfirmationPending) && styles.disabled]} onPress={exportEncryptedBackup} disabled={!keyAvailable || backupBusy || restoreConfirmationPending} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>{backupBusy ? "Operazione in corso…" : "Esporta backup cifrato"}</Text>
              </Pressable>
              <Text style={styles.backupLabel}>Ripristina da un backup</Text>
              <TextInput value={importPassphrase} onChangeText={setImportPassphrase} placeholder="Passphrase del backup" placeholderTextColor={COLORS.muted} style={styles.backupInput} secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="password" />
              <Pressable style={[styles.secondaryButton, (!keyAvailable || backupBusy || restoreConfirmationPending || entries.length > 0) && styles.disabled]} onPress={importEncryptedBackup} disabled={!keyAvailable || backupBusy || restoreConfirmationPending || entries.length > 0} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Seleziona e ripristina backup</Text>
              </Pressable>
              {entries.length > 0 ? <Text style={styles.auditWarning}>Per evitare sovrascritture, il ripristino è disabilitato perché questo Diario contiene già annotazioni.</Text> : null}
              <Pressable style={[styles.secondaryButton, activatingKey && styles.disabled]} onPress={activateProtectedDiary} disabled={activatingKey}>
                <Text style={styles.secondaryButtonText}>{activatingKey ? "Verifica protezione…" : "Verifica / attiva chiave protetta"}</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, (!keyAvailable || migrating) && styles.disabled]} onPress={importLegacyNote} disabled={!keyAvailable || migrating}>
                <Text style={styles.secondaryButtonText}>Importa la vecchia nota locale</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, (!keyAvailable || migrating) && styles.disabled]} onPress={importLegacySqliteJournal} disabled={!keyAvailable || migrating}>
                <Text style={styles.secondaryButtonText}>{migrating ? "Migrazione in corso…" : "Importa annotazioni SQLite storiche"}</Text>
              </Pressable>
              {privacyAudit ? (
                <View style={styles.auditPanel} accessibilityLiveRegion="polite">
                  <Text style={styles.auditTitle}>Controllo dei dati locali</Text>
                  <Text style={styles.auditText}>
                    {privacyAudit.legacyJournalTableExists
                      ? `Archivio storico SQLite: ${privacyAudit.legacyPlaintextEntryCount} annotazioni non cifrate rilevate.`
                      : "Nessun archivio storico SQLite rilevato."}
                  </Text>
                  <Text style={styles.auditText}>
                    {privacyAudit.encryptedDiaryTableExists
                      ? "Archivio Diario cifrato: tabella presente."
                      : "Archivio Diario cifrato: tabella non ancora presente."}
                  </Text>
                  {privacyAudit.legacyPlaintextEntryCount > 0 ? (
                    <Text style={styles.auditWarning}>Non eliminare i dati storici. Prima del rilascio occorre verificare ed eseguire una migrazione cifrata.</Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Nuova annotazione</Text>
              <View style={styles.typeRow}>
                {TYPES.map((item) => (
                  <Pressable key={item.value} onPress={() => setType(item.value)} style={[styles.typeChip, type === item.value && styles.typeChipSelected]}>
                    <Text style={[styles.typeText, type === item.value && styles.typeTextSelected]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput value={title} onChangeText={setTitle} placeholder="Titolo (facoltativo)" placeholderTextColor={COLORS.muted} style={styles.input} maxLength={120} />
              <TextInput value={body} onChangeText={setBody} placeholder="Scrivi qui i tuoi pensieri..." placeholderTextColor={COLORS.muted} style={[styles.input, styles.bodyInput]} multiline textAlignVertical="top" maxLength={20000} />
              <Pressable onPress={saveEntry} disabled={saving || !keyAvailable} style={[styles.saveButton, (saving || !keyAvailable) && styles.disabled]} accessibilityRole="button" accessibilityLabel="Salva annotazione nel diario protetto">
                <Text style={styles.saveText}>{saving ? "Salvataggio…" : "Salva nel diario"}</Text>
              </Pressable>
              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            </View>
            <Text style={styles.listTitle}>Le tue annotazioni</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Non hai ancora annotazioni. Puoi iniziare da una preghiera o da un motivo di gratitudine.</Text>}
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryTop}>
              <Text style={styles.entryType}>{TYPES.find((x) => x.value === item.type)?.label ?? item.type}</Text>
              <Pressable onPress={() => confirmDelete(item)} accessibilityRole="button" accessibilityLabel="Elimina annotazione">
                <Text style={styles.deleteText}>Elimina</Text>
              </Pressable>
            </View>
            {item.title ? <Text style={styles.entryTitle}>{item.title}</Text> : null}
            <Text style={styles.entryBody}>{item.body}</Text>
            <Text style={styles.date}>{new Date(item.updatedAt).toLocaleString("it-IT")}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background, padding: 24 },
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  header: { gap: 14 },
  eyebrow: { color: COLORS.muted, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  heading: { color: COLORS.green, fontSize: 30, fontWeight: "600" },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 22 },
  securityCard: { backgroundColor: COLORS.green, padding: 16, borderRadius: 14, gap: 9 },
  securityTitle: { color: COLORS.gold, fontWeight: "700", fontSize: 15 },
  securityText: { color: COLORS.ivory, fontSize: 13, lineHeight: 20 },
  auditPanel: { backgroundColor: "#243B37", borderRadius: 10, padding: 11, gap: 5 },
  auditTitle: { color: COLORS.gold, fontSize: 12, fontWeight: "700" },
  auditText: { color: COLORS.ivory, fontSize: 11, lineHeight: 17 },
  auditWarning: { color: "#FFD6A6", fontSize: 11, lineHeight: 17, fontWeight: "600" },
  recoveryWarning: { color: "#FFD6A6", fontSize: 11, lineHeight: 17, fontWeight: "600" },
  backupLabel: { color: COLORS.gold, fontSize: 12, fontWeight: "700", marginTop: 5 },
  backupInput: { borderWidth: 1, borderColor: "#71827D", borderRadius: 8, padding: 10, color: COLORS.ivory, fontSize: 13 },
  secondaryButton: { borderColor: COLORS.gold, borderWidth: 1, borderRadius: 9, padding: 11, alignItems: "center", marginTop: 3 },
  secondaryButtonText: { color: COLORS.gold, fontWeight: "600", fontSize: 12 },
  form: { backgroundColor: COLORS.surface, borderRadius: 15, borderWidth: 1, borderColor: COLORS.line, padding: 16, gap: 12 },
  formTitle: { color: COLORS.green, fontSize: 18, fontWeight: "600" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  typeChip: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 10 },
  typeChipSelected: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  typeText: { color: COLORS.green, fontSize: 11 },
  typeTextSelected: { color: COLORS.ivory, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 9, padding: 12, color: COLORS.green, fontSize: 14 },
  bodyInput: { minHeight: 130 },
  saveButton: { backgroundColor: COLORS.green, borderRadius: 10, padding: 14, alignItems: "center" },
  saveText: { color: COLORS.ivory, fontWeight: "700" },
  disabled: { opacity: 0.55 },
  error: { color: "#A13D32", fontSize: 13, lineHeight: 19 },
  listTitle: { color: COLORS.green, fontSize: 20, fontWeight: "600", marginTop: 8 },
  empty: { color: COLORS.muted, lineHeight: 22, paddingVertical: 10 },
  entryCard: { backgroundColor: COLORS.surface, borderRadius: 13, borderWidth: 1, borderColor: COLORS.line, padding: 15, gap: 8 },
  entryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  entryType: { color: COLORS.muted, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: "700" },
  deleteText: { color: "#A13D32", fontSize: 12 },
  entryTitle: { color: COLORS.green, fontWeight: "700", fontSize: 16 },
  entryBody: { color: COLORS.green, fontSize: 14, lineHeight: 22 },
  date: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
});
