import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderColor: '#cfcfcf', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, marginRight: 8, marginBottom: 8 },
  text: { color: '#333', fontSize: 12 },
});