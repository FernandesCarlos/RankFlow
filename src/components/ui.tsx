import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  StyleProp,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

export function Screen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Adapta o espaçamento ao tamanho da tela e limita a largura em telas grandes.
  const horizontalPadding = width < 360 ? 14 : width < 600 ? 20 : 28;
  const maxContentWidth = width >= 768 ? 720 : undefined;

  const content = (
    <View
      style={[
        styles.screenContent,
        {
          paddingTop: insets.top + 12,
          paddingHorizontal: horizontalPadding,
          maxWidth: maxContentWidth,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </KeyboardAvoidingView>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        disabled={!onBack}
        hitSlop={10}
        style={styles.headerSide}
      >
        {onBack ? <Text style={styles.back}>←</Text> : null}
      </Pressable>

      <View style={styles.headerCenter}>
        {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>

      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
        {right}
      </View>
    </View>
  );
}

export function Title({
  children,
  subtitle,
  centered = false,
}: {
  children: ReactNode;
  subtitle?: string;
  centered?: boolean;
}) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={[styles.title, centered && { textAlign: 'center' }]}>
        {children}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, centered && { textAlign: 'center' }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.subtle}
        style={[styles.input, props.multiline && styles.multiline]}
      />
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && { opacity: 0.45 },
        pressed && !disabled && { opacity: 0.84 },
      ]}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function OutlineButton({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outlineButton,
        pressed && { backgroundColor: colors.primarySoft },
      ]}
    >
      <Text style={styles.outlineButtonText}>{title}</Text>
    </Pressable>
  );
}

export function TextButton({
  title,
  onPress,
  danger = false,
}: {
  title: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.textButton}>
      <Text
        style={[
          styles.textButtonText,
          danger && { color: colors.danger },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function InfoBox({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'success' | 'danger' | 'warning';
}) {
  const toneStyle =
    tone === 'success'
      ? { backgroundColor: colors.successSoft, borderColor: '#BBE8C9' }
      : tone === 'danger'
        ? { backgroundColor: colors.dangerSoft, borderColor: '#FECACA' }
        : tone === 'warning'
          ? { backgroundColor: colors.warningSoft, borderColor: '#FDE68A' }
          : { backgroundColor: colors.primarySoft, borderColor: '#BFDBFE' };

  return (
    <View style={[styles.infoBox, toneStyle]}>
      <Text style={styles.infoText}>{children}</Text>
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Stat({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, compact && { fontSize: 18 }]}>
        {value}
      </Text>
    </View>
  );
}

export function Avatar({
  initials = 'CE',
  size = 44,
}: {
  initials?: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          { fontSize: Math.max(14, size * 0.32) },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function SettingRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.settingRow}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.settingIconText}>{icon ?? '•'}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {right ?? (onPress ? <Text style={styles.chevron}>›</Text> : null)}
    </Pressable>
  );
}

export function ProgressBar({
  value,
}: {
  value: number;
}) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${normalized}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
  },
  screenContent: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 28,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSide: {
    width: 48,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  back: {
    color: '#344054',
    fontSize: 30,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  fieldWrap: {
    marginBottom: 15,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },
  multiline: {
    height: 88,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  outlineButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  textButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 16,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  infoText: {
    color: '#475467',
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  avatar: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#D6E4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  settingRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  settingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  settingSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  chevron: {
    color: colors.subtle,
    fontSize: 28,
    marginLeft: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E9EEF5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
