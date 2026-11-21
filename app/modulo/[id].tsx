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

  const available = item.status === 'ready';

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.ivory} /></Pressable>
        <Text style={styles.eyebrow}>MODULO {String(item.id).padStart(3, '0')}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <AppCard>
        {available ? (
          <>
            <Text style={styles.section}>Contenuto disponibile</Text>
            <Text style={styles.body}>Questo modulo è presente nel catalogo iniziale. In questa versione sono registrati titolo e categoria; la meditazione completa, le preghiere e le attività quotidiane saranno aggiunte nel passaggio editoriale dei contenuti.</Text>
          </>
        ) : (
          <>
            <Text style={styles.section}>Contenuto da integrare</Text>
            <Text style={styles.body}>Questo elemento è già predisposto nel catalogo, ma il contenuto spirituale completo non è ancora stato inserito. È contrassegnato come bozza per non presentare testi mancanti come già realizzati.</Text>
          </>
        )}
      </AppCard>
      <AppButton
        title={item.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        secondary
        onPress={async () => { await toggleFavorite(db, item.id, item.favorite === 1); await refresh(); }}
      />
      <AppButton
        title={item.completed ? 'Segna come non completato' : 'Segna come completato'}
        onPress={async () => { await setModuleCompleted(db, item.id, item.completed !== 1); await refresh(); }}
      />
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
});
