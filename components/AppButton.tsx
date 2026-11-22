import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

export function AppButton({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: colors.ivory, borderWidth: 1, borderColor: colors.goldDeep },
  text: { color: colors.white, fontWeight: '700', fontSize: 15 },
  secondaryText: { color: colors.forest },
  pressed: { opacity: 0.78 },
});
