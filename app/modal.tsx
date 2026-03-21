import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">About Savorly</ThemedText>
      <ThemedText style={styles.copy}>
        Savorly is your place to collect craveable dishes, browse ingredients, and find recipes you actually want to
        make.
      </ThemedText>
      <Link href="/(tabs)/discover" dismissTo style={styles.link}>
        <ThemedText type="link">Back to discover</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  copy: {
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
});
