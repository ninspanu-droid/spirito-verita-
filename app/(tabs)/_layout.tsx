import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'sunny-outline',
  parola: 'book-outline',
  preghiera: 'heart-outline',
  adorazione: 'musical-notes-outline',
  profilo: 'person-circle-outline',
};

const labels: Record<string, string> = {
  index: 'Oggi',
  parola: 'Parola',
  preghiera: 'Preghiera',
  adorazione: 'Adorazione',
  profilo: 'Profilo',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.goldDeep,
        tabBarInactiveTintColor: '#8A918B',
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          height: 64,
          paddingTop: 7,
          paddingBottom: 7,
        },
        tabBarLabel: labels[route.name],
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name] ?? 'ellipse-outline'} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="parola" />
      <Tabs.Screen name="preghiera" />
      <Tabs.Screen name="adorazione" />
      <Tabs.Screen name="profilo" />
    </Tabs>
  );
}
