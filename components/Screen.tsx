import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

type Props = PropsWithChildren<{ scroll?: boolean }>;

export function Screen({ children, scroll = true }: Props) {
  if (!scroll) {
    return <View style={styles.static}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ivory },
  static: { flex: 1, backgroundColor: colors.ivory },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
});
