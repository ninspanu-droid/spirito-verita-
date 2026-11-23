import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { AppCard } from '../../components/AppCard';
import { AppButton } from '../../components/AppButton';
import { colors, spacing } from '../../constants/theme';
import { getCatalog, setModuleCompleted, toggleFavorite, type CatalogRow } from '../../database/database';
import { discipleshipLessons } from '../../data/discepolato';

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const moduleId = Number(id);
  const db = useSQLiteContext();
  const router = useRouter();
  const [item, setItem] = useState<CatalogRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const rows = await getCatalog(db);
    setItem(rows.find((row) => row.id === moduleId) ?? null);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [moduleId]);

  if (loading) return <Screen><ActivityIndicator color={colors.forest} /></Screen>;
  if (!item) return <Screen><Text>Modulo non trovato.</Text><AppButton title="Torna al catalogo" onPress={() => router.back()} /></Screen>;

  const lesson = discipleshipLessons.find((entry) => entry.id === moduleId);
  const available = item.status === 'ready';

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.ivory} /></Pressable>
        <Text style={styles.eyebrow}>MODULO {String(item.id).padStart(3, '0')}</Text>
      </View>
      <Text style={styles.title}>{lesson?.title ?? item.title}</Text>
      <Text style={styles.category}>{item.category}</Text>
      {lesson ? <>
        <AppCard>
          <Text style={styles.section}>Obiettivo dello studio</Text>
          <Text style={styles.body}>{lesson.aim}</Text>
          <Text style={styles.section}>Tema</Text>
          <Text style={styles.body}>{lesson.theme}</Text>
          <Text style={styles.section}>Brani biblici</Text>
          {lesson.reading.map((reference) => <Text key={reference} style={styles.bullet}>• {reference}</Text>)}
          <Text style={styles.caption}>Riferimento centrale: {lesson.reference}</Text>
        </AppCard>
        <AppCard>
          <Text style={styles.section}>Insegnamento</Text>
          {lesson.teaching.map((point, index) => <Text key={index} style={styles.body}>{index + 1}. {point}</Text>)}
        </AppCard>
        <AppCard>
          <Text style={styles.section}>Domande per la riflessione</Text>
          {lesson.questions.map((question, index) => <Text key={index} style={styles.body}>{index + 1}. {question}</Text>)}
        </AppCard>
        <AppCard>
          <Text style={styles.section}>Applicazione pratica</Text>
          <Text style={styles.body}>{lesson.practice}</Text>
          <Text style={styles.section}>Preghiera</Text>
          <Text style={styles.body}>{lesson.prayer}</Text>
        </AppCard>
      </> : <AppCard>
        <Text style={styles.section}>{available ? 'Contenuto disponibile' : 'Contenuto da integrare'}</Text>
        <Text style={styles.body}>Questo modulo non appartiene ancora al percorso di discepolato. Il contenuto sarà integrato in un successivo aggiornamento editoriale.</Text>
      </AppCard>}
      <AppButton title={item.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'} secondary onPress={async () => { await toggleFavorite(db, item.id, item.favorite === 1); await refresh(); }} />
      <AppButton title={item.completed ? 'Segna come non completato' : 'Segna come completato'} onPress={async () => { await setModuleCompleted(db, item.id, item.completed !== 1); await refresh(); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.forest, borderRadius: 18, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.forestSoft, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.gold, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.forest, fontSize: 25, fontWeight: '800', lineHeight: 32 },
  category: { color: colors.goldDeep, fontWeight: '700' },
  section: { color: colors.forest, fontWeight: '800', fontSize: 18 },
  body: { color: colors.ink, fontSize: 14, lineHeight: 23 },
  bullet: { color: colors.ink, fontSize: 14, lineHeight: 22 },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
