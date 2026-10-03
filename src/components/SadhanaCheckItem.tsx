import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SadhanaItem } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

const CATEGORY_ICONS: Record<SadhanaItem['category'], keyof typeof Ionicons.glyphMap> = {
  puja: 'flower-outline',
  japa: 'musical-notes-outline',
  meditation: 'water-outline',
  reading: 'book-outline',
  service: 'heart-outline',
  other: 'ellipse-outline',
};

type Props = {
  item: SadhanaItem;
  onToggle: (id: string) => void;
};

export function SadhanaCheckItem({ item, onToggle }: Props) {
  return (
    <Pressable
      onPress={() => onToggle(item.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.completed }}
      accessibilityLabel={item.title}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, item.completed && styles.iconWrapDone]}>
        <Ionicons
          name={CATEGORY_ICONS[item.category]}
          size={20}
          color={item.completed ? Colors.surface : Colors.primary}
        />
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={[styles.title, item.completed && styles.titleDone]}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        ) : null}
      </View>

      {/* Check */}
      <Ionicons
        name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={item.completed ? Colors.success : Colors.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDone: { backgroundColor: Colors.primary },
  textWrap: { flex: 1 },
  title: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  titleDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
