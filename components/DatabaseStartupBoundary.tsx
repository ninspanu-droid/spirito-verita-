import React, { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';

type State = {
  hasError: boolean;
  diagnostic: string | null;
};

function safeDiagnostic(error: Error): string {
  // Show only the native error message needed for support. Never show keys,
  // SQL statements, database paths, or stack traces on the screen.
  const message = String(error?.message ?? 'Errore non specificato')
    .replace(/(?:\/data\/user\/\d+\/[^\s'"]+|file:\/\/[^\s'"]+)/gi, '[percorso locale]')
    .replace(/(?:key|chiave)\s*[:=]\s*['"]?[^\s'"]+/gi, '$1=[oscurata]')
    .replace(/\s+/g, ' ')
    .trim();
  return message.slice(0, 320) || 'Errore non specificato';
}

export class DatabaseStartupBoundary extends React.Component<PropsWithChildren, State> {
  state: State = { hasError: false, diagnostic: null };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('[SPIRITO_VERITA_DATABASE_STARTUP]', error);
    this.setState({ diagnostic: safeDiagnostic(error) });
  }

  private retry = (): void => {
    this.setState({ hasError: false, diagnostic: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.brand}>SPIRITO & VERITÀ</Text>
          <Text style={styles.title}>Impossibile avviare l'app</Text>
          <Text style={styles.message}>
            Non è stato possibile inizializzare in sicurezza l'archivio locale.
            I tuoi dati non sono stati cancellati. Non disinstallare l'app e non
            cancellare i dati: comunica il codice tecnico qui sotto all'assistenza.
          </Text>
          <Text selectable style={styles.diagnosticLabel}>DETTAGLIO TECNICO</Text>
          <Text selectable style={styles.diagnostic}>
            {this.state.diagnostic ?? 'Raccolta del dettaglio in corso…'}
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
  diagnosticLabel: {
    color: colors.goldDeep,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  diagnostic: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    padding: spacing.md,
    backgroundColor: '#E9E4D8',
    borderRadius: 10,
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
