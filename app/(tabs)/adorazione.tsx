import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppCard } from '../../components/AppCard';
import { colors } from '../../constants/theme';
import { worshipSuggestions } from '../../data/devotional';

export default function WorshipScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Adorazione</Text>
      <Text style={styles.intro}>Uno spazio per riconoscere la presenza di Dio, con il silenzio, la lode e la gratitudine.</Text>
      {worshipSuggestions.map((item, index) => (
        <AppCard key={item.title}>
          <Text style={styles.number}>0{index + 1}</Text>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.desc}>{item.detail}</Text>
        </AppCard>
      ))}
      <AppCard style={styles.feature}>
        <Text style={styles.featureTitle}>Resta in ascolto</Text>
        <Text style={styles.featureText}>Siediti in un luogo tranquillo. Lascia da parte per qualche minuto le distrazioni e offri a Dio la tua attenzione.</Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.forest, fontSize: 28, fontWeight: '800' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  number: { color: colors.goldDeep, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  name: { color: colors.forest, fontSize: 18, fontWeight: '700' },
  desc: { color: colors.ink, lineHeight: 21 },
  feature: { backgroundColor: colors.forest, borderColor: colors.forest },
  featureTitle: { color: colors.gold, fontSize: 19, fontWeight: '700' },
  featureText: { color: colors.ivory, lineHeight: 22 },
});
