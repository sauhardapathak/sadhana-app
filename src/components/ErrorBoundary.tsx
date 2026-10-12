/**
 * Root error boundary — catches render crashes anywhere in the tree and
 * shows a themed fallback with a dependency-free restart (no expo-updates).
 */
import React, { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { FontSize, Radius, Spacing, useTheme } from '../constants/theme';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  private handleRestart = () => {
    this.setState({ hasError: false });
    router.replace('/(tabs)');
  };

  render() {
    if (this.state.hasError) {
      return <FallbackView onRestart={this.handleRestart} />;
    }
    return this.props.children;
  }
}

function FallbackView({ onRestart }: { onRestart: () => void }) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: t.background }]}>
      <Text style={[styles.title, { color: t.textPrimary }]}>
        We&apos;re sorry — something went wrong.
      </Text>
      <Text style={[styles.body, { color: t.textSecondary }]}>
        Your practice data is safe. Restart the app to continue where you left
        off.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRestart}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: t.primaryStrong, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={[styles.buttonLabel, { color: t.textInverse }]}>
          Restart
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
  },
  buttonLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
