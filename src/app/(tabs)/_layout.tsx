import { Tabs } from 'expo-router';
import {
  CirclePlus,
  Home,
  Trophy,
  Users,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="amigos"
        options={{
          title: 'Amigos',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="treino"
        options={{
          title: 'Treino',
          tabBarIcon: ({ color, size }) => (
            <CirclePlus color={color} size={size} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="placar"
        options={{
          title: 'Placar',
          tabBarIcon: ({ color, size }) => (
            <Trophy color={color} size={size} strokeWidth={2} />
          ),
        }}
      />

      <Tabs.Screen
        name="estatisticas"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
