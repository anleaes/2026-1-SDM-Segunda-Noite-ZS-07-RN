import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

type Props = { text: string; color?: string };
export default function Badge({ text, color = COLORS.primary }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  text: { color: '#fff', fontSize: 12 },
});