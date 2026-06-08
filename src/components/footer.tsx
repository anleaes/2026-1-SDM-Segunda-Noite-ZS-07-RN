import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {COLORS} from '../constants/theme';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        © 2026 Adotar&Amar • Trabalho Acadêmico • Porto Alegre, RS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: COLORS.dark,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: 'center',
  },
});