import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppCard } from '../../components/AppCard';
import { colors } from '../../constants/theme';
import { bibleTopics } from '../../data/devotional';

export default function WordScreen() {
  return (
    <Screen>
      <Text style={styles.title}>La Parola</Text>
      <Text style={styles.intro}>Spunti per leggere, meditare e portare la Scrittura nella vita quotidiana.</Text>
      {bibleTopics.map((item) => (
        <AppCard key={item.title}>
          <Text style={styles.name}>{item.title}</Text>
          <Text style={styles.ref}>{item.reference}</Text>
          <Text style={styles.desc}>{item.description}</Text>
        </AppCard>
      ))}
      <Text style={styles.notice}>I riferimenti sono indicazioni di lettura: per visualizzare il testo integrale occorre integrare una traduzione biblica con licenza adeguata.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.forest, fontSize: 28, fontWeight: '800' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  name: { color: colors.forest, fontSize: 18, fontWeight: '700' },
  ref: { color: colors.goldDeep, fontWeight: '700' },
  desc: { color: colors.ink, lineHeight: 21 },
  notice: { color: colors.muted, fontSize: 12, lineHeight: 18, paddingHorizontal: 4 },
});
