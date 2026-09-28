import React, { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

// Static placeholders also respect reduced-motion preferences without animation.
export function LoadingSkeleton({ label = 'Carregando dados' }: { label?: string }) {
  return <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} accessibilityLiveRegion="polite" style={styles.container}>
    <Text style={styles.label}>{label}…</Text>
    <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {[0, 1, 2].map(index => <View key={index} style={styles.card}>
        <View style={styles.row}><View style={styles.avatar} /><View style={styles.line} /></View>
        <View style={styles.line} /><View style={[styles.line, { width: '60%' }]} />
      </View>)}
    </View>
  </View>;
}

// Simulates a pending mock request. Real API integration can drive loading directly.
export function MockData({ children, label = 'Carregando dados', resourceKey = 'default' }: { children: ReactNode; label?: string; resourceKey?: string }) {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setLoadedKey(resourceKey), 450);
    return () => clearTimeout(timer);
  }, [resourceKey]);
  return loadedKey === resourceKey ? <>{children}</> : <LoadingSkeleton label={label} />;
}
const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { color: colors.muted, fontSize: 15, marginBottom: 12 },
  card: { padding: 20, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 12, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.border },
  line: { height: 16, width: '75%', maxWidth: '100%', borderRadius: 6, backgroundColor: colors.border },
});
