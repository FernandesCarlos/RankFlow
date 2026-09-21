import React, { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { colors } from '../theme/colors';

/** Área real de toque e foco visível compartilhados por todos os controles. */
export function AccessiblePressable({ style, onFocus, onBlur, accessibilityRole = 'button', ...props }: PressableProps) {
  const [focused, setFocused] = useState(false);
  return <Pressable
    {...props}
    accessibilityRole={accessibilityRole}
    onFocus={event => { setFocused(true); onFocus?.(event); }}
    onBlur={event => { setFocused(false); onBlur?.(event); }}
    style={state => [
      { minHeight: 48, minWidth: 48, justifyContent: 'center', borderRadius: 8 },
      typeof style === 'function' ? style(state) : style,
      state.pressed && !props.disabled && { opacity: 0.78 },
      focused && { outlineColor: colors.primary, outlineWidth: 3, outlineOffset: 2, outlineStyle: 'solid' },
    ]}
  />;
}
