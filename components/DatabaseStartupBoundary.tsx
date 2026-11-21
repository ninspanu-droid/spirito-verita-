import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

type State = {
  hasError: boolean;
};

export class DatabaseStartupBoundary extends React.Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // Keep technical details in the device log for diagnosis, never expose
    // database paths, SQL statements, or other internal details on screen.
    console.error('[SPIRITO_VERITA_DATABASE_STARTUP]', error);
  }

  private retry = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.brand}>SPIRITO & VERITÀ</Text>
          <Text style={styles.title}>Impossibile avviare l'app</Text>
          <Text style={styles.message}>
            Non è stato possibile inizializzare in sicurezza l'archivio locale.
            I tuoi dati non sono stati cancellati. Riprova; se il problema
            continua, invia il registro tecnico all'assistenza.
          </Text>
          <Pressable accessibilityRole="button" onPress={this.retry} style={styles.button}>
            <Text style={styles.buttonText}>Riprova</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.ivory,
  },
  brand: {
    color: colors.goldDeep,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: colors.forest,
    fontSize: 25,
    fontWeight: '800',
  },
  message: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 23,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: colors.forest,
  },
  buttonText: {
    color: colors.ivory,
    fontSize: 15,
    fontWeight: '700',
  },
});
