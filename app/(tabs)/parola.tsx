import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { AppCard } from '../../components/AppCard';
import { colors, radius, spacing } from '../../constants/theme';
import bibleData from '../../data/bible.generated';

type Verse = { number: string; text: string };
type Chapter = { number: number; verses: Verse[] };
type BibleBook = { id: string; name: string; chapters: Chapter[] };
type SearchHit = { book: string; chapter: number; number: string; text: string };
const bibleBooks = bibleData as BibleBook[];

export default function WordScreen() {
  const [bookId, setBookId] = useState(bibleBooks[0]?.id ?? 'GEN');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [search, setSearch] = useState('');
  const selectedBook = bibleBooks.find((book) => book.id === bookId) ?? bibleBooks[0];
  const selectedChapter = selectedBook?.chapters.find((chapter) => chapter.number === chapterNumber) ?? selectedBook?.chapters[0];
  const searchHits = useMemo<SearchHit[]>(() => {
    const query = search.trim().toLocaleLowerCase('it');
    if (query.length < 3) return [];
    const hits: SearchHit[] = [];
    for (const book of bibleBooks) for (const chapter of book.chapters) for (const verse of chapter.verses) {
      if (verse.text.toLocaleLowerCase('it').includes(query)) {
        hits.push({ book: book.name, chapter: chapter.number, number: verse.number, text: verse.text });
        if (hits.length >= 60) return hits;
      }
    }
    return hits;
  }, [search]);
  const chooseBook = (id: string) => { setBookId(id); setChapterNumber(1); setSearch(''); };

  return <Screen>
    <Text style={styles.title}>La Parola</Text>
    <Text style={styles.intro}>Leggi e cerca il testo integrale della Bibbia.</Text>
    <AppCard>
      <Text style={styles.version}>Riveduta Bibbia 1927</Text>
      <Text style={styles.caption}>Traduzione italiana di pubblico dominio · Testo completo offline</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="Cerca una parola o una frase…" placeholderTextColor={colors.muted} style={styles.search} autoCapitalize="none" returnKeyType="search" />
    </AppCard>
    {search.trim().length >= 3 ? <View style={styles.section}>
      <Text style={styles.sectionTitle}>Risultati della ricerca</Text>
      <Text style={styles.caption}>{searchHits.length === 60 ? 'Primi 60 risultati' : String(searchHits.length) + ' risultati'}</Text>
      {searchHits.map((hit, index) => <AppCard key={hit.book + '-' + hit.chapter + '-' + hit.number + '-' + index}>
        <Text style={styles.reference}>{hit.book} {hit.chapter}:{hit.number}</Text><Text style={styles.verse}>{hit.text}</Text>
      </AppCard>)}
      {searchHits.length === 0 ? <Text style={styles.caption}>Nessun versetto trovato.</Text> : null}
    </View> : <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scegli un libro</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {bibleBooks.map((book) => <Pressable key={book.id} onPress={() => chooseBook(book.id)} style={[styles.chip, book.id === bookId && styles.chipActive]}>
            <Text style={[styles.chipText, book.id === bookId && styles.chipTextActive]}>{book.name}</Text>
          </Pressable>)}
        </ScrollView>
      </View>
      {selectedBook ? <View style={styles.section}>
        <Text style={styles.sectionTitle}>{selectedBook.name}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {selectedBook.chapters.map((chapter) => <Pressable key={chapter.number} onPress={() => setChapterNumber(chapter.number)} style={[styles.chapterChip, chapter.number === (selectedChapter?.number ?? 1) && styles.chipActive]}>
            <Text style={[styles.chipText, chapter.number === (selectedChapter?.number ?? 1) && styles.chipTextActive]}>{chapter.number}</Text>
          </Pressable>)}
        </ScrollView>
        {selectedChapter?.verses.map((verse) => <AppCard key={selectedBook.id + '-' + selectedChapter.number + '-' + verse.number}>
          <View style={styles.verseRow}><Text style={styles.verseNumber}>{verse.number}</Text><Text style={styles.verse}>{verse.text}</Text></View>
        </AppCard>)}
      </View> : null}
    </>}
    <Text style={styles.legal}>Fonte: eBible.org · Riveduta Bibbia 1927 · Pubblico dominio. Il testo è distribuito senza modifiche sostanziali; la formattazione è adattata alla lettura nell’app.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  title: { color: colors.forest, fontSize: 28, fontWeight: '800' },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  version: { color: colors.forest, fontSize: 18, fontWeight: '800' },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  search: { backgroundColor: colors.ivory, color: colors.ink, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginTop: spacing.sm, fontSize: 15 },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.forest, fontSize: 20, fontWeight: '800' },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.paper },
  chapterChip: { width: 42, height: 42, borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  chipActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  chipText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  verseRow: { flexDirection: 'row', gap: spacing.sm },
  verseNumber: { color: colors.goldDeep, fontWeight: '800', minWidth: 24 },
  verse: { color: colors.ink, fontSize: 15, lineHeight: 24, flex: 1 },
  reference: { color: colors.goldDeep, fontSize: 13, fontWeight: '800' },
  legal: { color: colors.muted, fontSize: 11, lineHeight: 17, paddingHorizontal: spacing.xs },
});