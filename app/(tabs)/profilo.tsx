import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { AppCard } from '../../components/AppCard';
import { AppButton } from '../../components/AppButton';
import { colors } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [diagnostic, setDiagnostic] = useState<string>('');
  const [checking, setChecking] = useState(false);

  const runSecurityCheck = async () => {
    setChecking(true);
    setDiagnostic('');
    try {
      const cipher = await db.getFirstAsync<{ cipher_version: string }>('PRAGMA cipher_version');
      if (!cipher?.cipher_version) {
        throw new Error('SQLCipher non risulta disponibile in questa build.');
      }
      const cipherRows = await db.getAllAsync<Record<string, unknown>>('PRAGMA cipher_integrity_check');
      const integrityRows = await db.getAllAsync<{ integrity_check: string }>('PRAGMA integrity_check');
      const foreignKeyRows = await db.getAllAsync<Record<string, unknown>>('PRAGMA foreign_key_check');
      const integrityOk = integrityRows.length === 1 && integrityRows[0]?.integrity_check === 'ok';
      const cipherOk = cipherRows.length === 0 || cipherRows.every((row) =>
        Object.values(row).every((value) => String(value).toLowerCase() === 'ok')
      );
      const foreignKeysOk = foreignKeyRows.length === 0;
      setDiagnostic([
        `SQLCipher: ${cipher.cipher_version}`,
        `Integrità SQLite: ${integrityOk ? 'OK' : 'DA VERIFICARE'}`,
        `Integrità SQLCipher: ${cipherOk ? 'nessun errore restituito' : 'ERRORE'}`,
        `Chiavi esterne: ${foreignKeysOk ? 'OK' : 'DA VERIFICARE'}`,
        'Questo controllo diagnostico non sostituisce la prova di riavvio, backup e ripristino.'
      ].join('\n'));
      if (!integrityOk || !cipherOk || !foreignKeysOk) {
        setDiagnostic((current) => `${current}\nEsito complessivo: NON SUPERATO`);
      } else {
        setDiagnostic((current) => `${current}\nEsito complessivo: CONTROLLI LOCALI SUPERATI`);
      }
    } catch (error) {
      setDiagnostic(error instanceof Error ? error.message : 'Controllo non riuscito.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Il tuo spazio</Text>
      <Text style={styles.intro}>Un luogo personale per custodire pensieri e riflessioni.</Text>
      <AppCard>
        <Text style={styles.name}>Il mio diario</Text>
        <Text style={styles.desc}>Apri il diario protetto per raccogliere preghiere, intenzioni, gratitudine e riflessioni. La vecchia nota locale può essere importata dalla schermata del diario.</Text>
        <AppButton title="Apri il diario spirituale" onPress={() => router.push('/diario')} />
      </AppCard>
      <AppCard>
        <Text style={styles.name}>Verifica tecnica del database</Text>
        <Text style={styles.desc}>Esegui un controllo locale della disponibilità di SQLCipher e dell'integrità del database. Il risultato non invia dati e non mostra la chiave.</Text>
        <AppButton title={checking ? 'Controllo in corso…' : 'Verifica database protetto'} onPress={runSecurityCheck} secondary />
        {diagnostic ? <Text selectable style={styles.diagnostic}>{diagnostic}</Text> : null}
      </AppCard>
      <AppCard>
        <Text style={styles.name}>Privacy</Text>
        <Text style={styles.desc}>La vecchia nota salvata nella versione precedente resta in AsyncStorage finché non completi e verifichi l'importazione dal Diario. Il nuovo diario cifra titolo e testo con una chiave conservata in SecureStore; questa protezione richiede ancora test su dispositivi reali e revisione prima del rilascio.</Text>
      </AppCard>
      <View style={styles.footer}><Text style={styles.footerText}>SPIRITO & VERITÀ · Adorare con tutto il cuore</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.forest, fontSize: 28, fontWeight: '800' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  name: { color: colors.forest, fontSize: 18, fontWeight: '700' },
  desc: { color: colors.ink, lineHeight: 21 },
  diagnostic: { color: colors.ink, fontSize: 12, lineHeight: 18, fontVariant: ['tabular-nums'] },
  footer: { alignItems: 'center', paddingVertical: 12 },
  footerText: { color: colors.muted, fontSize: 11, letterSpacing: 0.5 },
});
