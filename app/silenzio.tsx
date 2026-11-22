import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../components/Screen';
import { AppCard } from '../components/AppCard';
import { AppButton } from '../components/AppButton';
import { colors, spacing } from '../constants/theme';

const PRESETS = [5, 10, 15, 20, 30];

export default function SilenceScreen() {
  const router = useRouter();
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const deadlineRef = useRef<number | null>(null);

  // Il tempo deriva da una scadenza assoluta, non dal numero di tick JS.
  // Al ritorno in foreground il residuo viene riallineato anche se il sistema
  // ha sospeso l'app. Non viene promessa una notifica mentre l'app è chiusa.
  useEffect(() => {
    if (!running) return;
    const updateRemaining = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setRunning(false);
        deadlineRef.current = null;
      }
    };
    updateRemaining();
    const timer = setInterval(updateRemaining, 500);
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') updateRemaining();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [running]);

  const selectPreset = (value: number) => {
    setMinutes(value);
    setRemaining(value * 60);
    deadlineRef.current = null;
    setRunning(false);
  };
  const reset = () => { deadlineRef.current = null; setRunning(false); setRemaining(minutes * 60); };
  const toggleTimer = () => {
    if (running) {
      const deadline = deadlineRef.current;
      const next = deadline === null ? remaining : Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      deadlineRef.current = null;
      setRemaining(next);
      setRunning(false);
      return;
    }
    const startFrom = remaining === 0 ? minutes * 60 : remaining;
    setRemaining(startFrom);
    deadlineRef.current = Date.now() + startFrom * 1000;
    setRunning(true);
  };
  const display = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>‹  Indietro</Text></Pressable>
        <Text style={styles.eyebrow}>UN TEMPO PER DIMORARE</Text>
        <Text style={styles.title}>Silenzio</Text>
        <Text style={styles.verse}>«Fermatevi e riconoscete che io sono Dio»</Text>
        <Text style={styles.reference}>Salmo 46:10</Text>
      </View>
      <AppCard>
        <View style={styles.timerCircle}>
          <Text style={styles.time}>{display}</Text>
          <Text style={styles.timerLabel}>{remaining === 0 ? 'TEMPO CONCLUSO' : 'NEL SILENZIO'}</Text>
        </View>
        <View style={styles.presets}>
          {PRESETS.map((value) => (
            <Pressable key={value} onPress={() => selectPreset(value)} style={[styles.preset, minutes === value && styles.presetActive]}>
              <Text style={[styles.presetText, minutes === value && styles.presetTextActive]}>{value}'</Text>
            </Pressable>
          ))}
        </View>
        <AppButton title={remaining === 0 ? 'Ricomincia' : running ? 'Metti in pausa' : 'Inizia'} onPress={toggleTimer} />
        <Pressable onPress={reset} style={styles.reset}><Text style={styles.resetText}>Azzera</Text></Pressable>
      </AppCard>
      <Text style={styles.section}>Una preghiera guidata</Text>
      <AppCard>
        <Text style={styles.step}>PASSO 1 DI 3 · FERMATI</Text>
        <Text style={styles.cardTitle}>Lascia spazio alla quiete</Text>
        <Text style={styles.copy}>Siediti comodamente. Rallenta il respiro e riconosci, senza fretta, di essere alla presenza di Dio.</Text>
        <View style={{ height: spacing.xs }} />
        <Text style={styles.step}>PASSO 2 · ASCOLTA</Text>
        <Text style={styles.copy}>Quando i pensieri arrivano, lasciali passare e torna con dolcezza a una breve preghiera.</Text>
        <View style={{ height: spacing.xs }} />
        <Text style={styles.step}>PASSO 3 · AFFIDA</Text>
        <Text style={styles.copy}>Consegna a Dio ciò che pesa sul tuo cuore e concludi con un semplice “Eccomi”.</Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { backgroundColor: colors.forest, borderRadius: 24, padding: 22, gap: 8 },
  back: { color: colors.gold, fontSize: 14, marginBottom: 8 },
  eyebrow: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.6, textAlign: 'center' },
  title: { color: colors.ivory, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  verse: { color: colors.ivory, fontSize: 18, fontStyle: 'italic', textAlign: 'center', lineHeight: 26, marginTop: 10 },
  reference: { color: colors.gold, textAlign: 'center', fontSize: 12 },
  timerCircle: { width: 210, height: 210, borderRadius: 105, borderWidth: 7, borderColor: colors.goldDeep, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest, gap: 4 },
  time: { color: colors.ivory, fontSize: 48, fontWeight: '300', fontVariant: ['tabular-nums'] },
  timerLabel: { color: colors.gold, fontSize: 10, letterSpacing: 1.3, fontWeight: '800' },
  presets: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  preset: { borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 11 },
  presetActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  presetText: { color: colors.forest, fontWeight: '700' },
  presetTextActive: { color: colors.forest },
  reset: { alignItems: 'center', padding: 8 },
  resetText: { color: colors.goldDeep, textDecorationLine: 'underline' },
  section: { color: colors.forest, fontSize: 19, fontWeight: '800', marginTop: spacing.sm },
  step: { color: colors.goldDeep, fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  cardTitle: { color: colors.forest, fontSize: 19, fontWeight: '700' },
  copy: { color: colors.ink, fontSize: 14, lineHeight: 22 },
});
