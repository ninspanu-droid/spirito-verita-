import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/Screen';
import { AppCard } from '../../components/AppCard';
import { AppButton } from '../../components/AppButton';
import { colors, spacing } from '../../constants/theme';
import { todayDevotional } from '../../data/devotional';

export default function TodayScreen() {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SPIRITO & VERITÀ</Text>
        <Text style={styles.brand}>Adorare con tutto il cuore</Text>
        <Text style={styles.tagline}>Fermati. Ascolta. Dimora.</Text>
      </View>

      <View style={styles.dateRow}>
        <View>
          <Text style={styles.dateLabel}>IL TUO TEMPO CON DIO</Text>
          <Text style={styles.dateTitle}>Oggi</Text>
        </View>
        <View style={styles.dateMark}><Text style={styles.dateMarkText}>✦</Text></View>
      </View>

      <AppCard>
        <Text style={styles.kicker}>LA PAROLA DI OGGI</Text>
        <Text style={styles.heading}>{todayDevotional.title}</Text>
        <Text style={styles.reference}>{todayDevotional.reference}</Text>
        <Text style={styles.body}>{todayDevotional.reflection}</Text>
        <View style={styles.divider} />
        <Text style={styles.prayerTitle}>Una preghiera</Text>
        <Text style={styles.body}>{todayDevotional.prayer}</Text>
        <AppButton
          title={completed ? 'Momento completato ✓' : 'Segna come completato'}
          onPress={() => setCompleted((value) => !value)}
          secondary={completed}
        />
      </AppCard>

      <Text style={styles.section}>Coltiva il tuo cammino</Text>
      <View style={styles.tiles}>
        <Pressable style={styles.tile} onPress={() => router.push('/catalogo')}>
          <Text style={styles.tileIcon}>▤</Text>
          <Text style={styles.tileTitle}>Percorsi</Text>
          <Text style={styles.tileText}>Un passo alla volta</Text>
        </Pressable>
        <Pressable style={styles.tile} onPress={() => router.push('/silenzio')}>
          <Text style={styles.tileIcon}>◌</Text>
          <Text style={styles.tileTitle}>Silenzio</Text>
          <Text style={styles.tileText}>Resta alla Sua presenza</Text>
        </Pressable>
        <Pressable style={styles.tile} onPress={() => router.push('/diario')}>
          <Text style={styles.tileIcon}>♡</Text>
          <Text style={styles.tileTitle}>Diario</Text>
          <Text style={styles.tileText}>Custodisci ciò che vivi</Text>
        </Pressable>
        <Pressable style={styles.tile} onPress={() => router.push('/(tabs)/adorazione')}>
          <Text style={styles.tileIcon}>♫</Text>
          <Text style={styles.tileTitle}>Adorazione</Text>
          <Text style={styles.tileText}>Innalza il tuo cuore</Text>
        </Pressable>
      </View>

      <AppCard>
        <Text style={styles.kicker}>UN INVITO SEMPLICE</Text>
        <Text style={styles.heading}>Cinque minuti di quiete</Text>
        <Text style={styles.body}>Lascia per un momento ciò che stai facendo. Respira con calma e affida a Dio ciò che oggi porti nel cuore.</Text>
        <AppButton title="Entra nel silenzio" onPress={() => router.push('/silenzio')} />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, borderRadius: 24, padding: 24, gap: 8 },
  eyebrow: { color: colors.gold, letterSpacing: 2.2, fontSize: 11, fontWeight: '800' },
  brand: { color: colors.ivory, fontSize: 27, fontWeight: '700' },
  tagline: { color: '#E7E2D7', fontSize: 14, fontStyle: 'italic' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  dateLabel: { color: colors.goldDeep, fontSize: 10, letterSpacing: 1.5, fontWeight: '800' },
  dateTitle: { color: colors.forest, fontSize: 26, fontWeight: '800' },
  dateMark: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  dateMarkText: { color: colors.forest, fontSize: 23 },
  kicker: { color: colors.goldDeep, fontSize: 10, letterSpacing: 1.5, fontWeight: '800' },
  heading: { color: colors.forest, fontSize: 21, fontWeight: '700' },
  reference: { color: colors.goldDeep, fontWeight: '700' },
  body: { color: colors.ink, fontSize: 14, lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.line },
  prayerTitle: { color: colors.forest, fontWeight: '700', fontSize: 16 },
  section: { color: colors.forest, fontSize: 19, fontWeight: '800', marginTop: spacing.sm },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', flexGrow: 1, backgroundColor: colors.forestSoft, borderRadius: 18, padding: 15, gap: 5, minHeight: 112 },
  tileIcon: { color: colors.gold, fontSize: 25 },
  tileTitle: { color: colors.ivory, fontSize: 16, fontWeight: '700' },
  tileText: { color: '#E7E2D7', fontSize: 11 },
});
