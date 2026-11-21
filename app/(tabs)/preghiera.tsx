import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppCard } from '../../components/AppCard';
import { colors } from '../../constants/theme';
import { prayerCategories } from '../../data/devotional';

export default function PrayerScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Preghiera</Text>
      <Text style={styles.intro}>Non servono parole perfette. Puoi rivolgerti a Dio con semplicità, così come sei.</Text>
      {prayerCategories.map((item) => (
        <AppCard key={item.title}>
          <View style={styles.row}>
            <View style={styles.icon}><Ionicons name={item.icon} size={22} color={colors.goldDeep} /></View>
            <View style={styles.copy}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.desc}>{item.detail}</Text>
            </View>
          </View>
        </AppCard>
      ))}
      <AppCard>
        <Text style={styles.name}>Una preghiera semplice</Text>
        <Text style={styles.desc}>Padre, eccomi davanti a te. Accogli ciò che sono, illumina le mie scelte e insegnami ad amare con un cuore sincero. Amen.</Text>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.forest, fontSize: 28, fontWeight: '800' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 4 },
  name: { color: colors.forest, fontSize: 17, fontWeight: '700' },
  desc: { color: colors.ink, lineHeight: 21 },
});
