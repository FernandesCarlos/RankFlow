import React from 'react';
import { Switch, Text, View } from 'react-native';
import { AccessiblePressable } from './AccessiblePressable';
import { colors } from '../theme/colors';

/** A linha inteira é um único alvo acessível; o switch interno é apenas visual. */
export function ToggleRow({ title, subtitle, value, onChange, disabled = false }: {
  title: string; subtitle: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean;
}) {
  return <AccessiblePressable
    accessibilityRole="switch" accessibilityLabel={title} accessibilityHint={subtitle}
    accessibilityState={{ checked: value, disabled }} disabled={disabled} onPress={() => onChange(!value)}
    style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, opacity: disabled ? 0.5 : 1 }}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>{subtitle}</Text>
    </View>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Switch accessible={false} focusable={false} value={value} disabled={disabled} trackColor={{ true: colors.primary }} />
    </View>
  </AccessiblePressable>;
}
