import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { AppCard } from '../components/AppCard';
import { AppButton } from '../components/AppButton';
import { colors, radius, spacing } from '../constants/theme';
import { getCatalog, toggleFavorite, type CatalogRow } from '../database/database';

const categories = ['Tutti', 'Discepolato', 'Consolazione', 'Famiglia', 'Relazioni', 'Discernimento', 'Da completare'];

export default function CatalogScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tutti');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await getCatalog(db, search, category, favoritesOnly));
    } finally {
      setLoading(false);
    }
  }, [db, search, category, favoritesOnly]);

  useEffect(() => { refresh(); }, [refresh]);

  const onFavorite = async (item: CatalogRow) => {
    await toggleFavorite(db, item.id, item.favorite === 1);
    await refresh();
  };

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color={colors.ivory} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>SPIRITO & VERITÀ</Text>
          <Text style={styles.title}>Percorsi spirituali</Text>
        </View>
      </View>

      <Text style={styles.intro}>Esplora il catalogo, cerca un tema e conserva i moduli che desideri ritrovare.</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Cerca un tema o un modulo..."
        placeholderTextColor={colors.muted}
        style={styles.search}
        returnKeyType="search"
      />

      <View style={styles.filters}>
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}>
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <AppButton
        title={favoritesOnly ? 'Mostra tutto il catalogo' : 'Mostra solo i preferiti'}
        secondary={!favoritesOnly}
        onPress={() => setFavoritesOnly((value) => !value)}
      />

      {loading ? <ActivityIndicator color={colors.forest} /> : (
        <>
          <Text style={styles.count}>{rows.length} moduli nel risultato</Text>
          {rows.map((item) => (
            <AppCard key={item.id}>
              <View style={styles.cardRow}>
                <Pressable style={{ flex: 1, gap: 5 }} onPress={() => router.push(`/modulo/${item.id}`)}>
                  <Text style={styles.moduleNo}>MODULO {String(item.id).padStart(3, '0')}</Text>
                  <Text style={styles.moduleTitle}>{item.title}</Text>
                  <Text style={styles.meta}>{item.category} · {item.status === 'ready' ? 'Contenuto disponibile' : 'Contenuto da integrare'}</Text>
                  {item.completed === 1 ? <Text style={styles.done}>Completato ✓</Text> : null}
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Aggiungi o rimuovi dai preferiti" onPress={() => onFavorite(item)} style={styles.star}>
                  <Ionicons name={item.favorite ? 'star' : 'star-outline'} size={23} color={colors.goldDeep} />
                </Pressable>
              </View>
            </AppCard>
          ))}
          {rows.length === 0 ? <Text style={styles.empty}>Nessun modulo trovato. Prova a modificare la ricerca o il filtro.</Text> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { backgroundColor: colors.forest, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.forestSoft, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: '800' },
  title: { color: colors.ivory, fontSize: 22, fontWeight: '800' },
  intro: { color: colors.muted, lineHeight: 21 },
  search: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14, color: colors.ink },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.paper },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { color: colors.ink, fontSize: 12 },
  chipTextActive: { color: colors.ivory, fontWeight: '700' },
  count: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moduleNo: { color: colors.goldDeep, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  moduleTitle: { color: colors.forest, fontSize: 16, fontWeight: '700' },
  meta: { color: colors.muted, fontSize: 12 },
  done: { color: colors.success, fontSize: 12, fontWeight: '700' },
  star: { padding: 8 },
  empty: { color: colors.muted, textAlign: 'center', padding: 20 },
});
