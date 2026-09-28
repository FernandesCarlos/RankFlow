import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import {
  CirclePlus,
  Settings,
  Home,
  Trophy,
  Users,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveBackgroundColor: colors.primarySoft,
        tabBarItemStyle: { minHeight: 48 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 64 + Math.max(0, fontScale - 1) * 24 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(8, insets.bottom),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 14,
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

      <Tabs.Screen name="configuracoes" options={{
        title: 'Configurações', tabBarLabel: 'Config.',
        tabBarAccessibilityLabel: 'Configurações, aba',
        tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={2} />,
      }} />
    </Tabs>
  );
}
