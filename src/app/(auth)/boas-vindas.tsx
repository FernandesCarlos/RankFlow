import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  OutlineButton,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';

const features = [
  {
    icon: '↗',
    title: 'Acompanhe sua evolução',
    description: 'Rating, submissões e desempenho por assunto.',
  },
  {
    icon: '◎',
    title: 'Treinos personalizados',
    description: 'Escolha dificuldade, tags e participantes.',
  },
  {
    icon: '▤',
    title: 'Compita com amigos',
    description: 'Crie desafios e acompanhe o placar.',
  },
];

export default function BoasVindasScreen() {
  return (
    <Screen contentStyle={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>R</Text>
      </View>

      <Text style={styles.logo}>RankFlow</Text>
      <Text style={styles.tagline}>Treine melhor. Evolua com dados.</Text>

      <View style={styles.features}>
        {features.map((item) => (
          <Card key={item.title} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDescription}>
                {item.description}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <PrimaryButton
        title="Entrar"
        onPress={() => router.push('/(auth)/login')}
      />

      <OutlineButton
        title="Criar conta"
        onPress={() => router.push('/(auth)/cadastro')}
      />

      <Text style={styles.terms}>
        Ao continuar, você concorda com os termos de uso.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  logo: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 14,
  },
  tagline: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 15,
    marginTop: 5,
    marginBottom: 26,
  },
  features: {
    marginBottom: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  featureTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  featureDescription: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  terms: {
    color: colors.subtle,
    textAlign: 'center',
    fontSize: 11,
    marginTop: 18,
  },
});
