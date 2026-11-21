import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { colors } from '../constants/theme';
import { initializeSecureDatabase, secureDatabaseNames } from '../database/secureDatabase';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={secureDatabaseNames.encrypted} onInit={initializeSecureDatabase}>
      <>
        <StatusBar style="light" backgroundColor={colors.forest} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="catalogo" options={{ presentation: 'card' }} />
          <Stack.Screen name="silenzio" options={{ presentation: 'card' }} />
          <Stack.Screen name="diario" options={{ presentation: 'card', title: 'Diario spirituale' }} />
          <Stack.Screen name="modulo/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </>
    </SQLiteProvider>
  );
}
