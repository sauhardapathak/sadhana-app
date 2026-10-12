import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SadhanaItem } from '../types';
import { useTheme, FontSize, Radius, Spacing } from '../constants/theme';

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
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onToggle(item.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.completed }}
      accessibilityLabel={item.title}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: item.completed ? t.primaryStrong : t.surfaceAlt },
        ]}
      >
        <Ionicons
          name={CATEGORY_ICONS[item.category]}
          size={20}
          color={item.completed ? t.textInverse : t.primaryStrong}
        />
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: item.completed ? t.textMuted : t.textPrimary }, item.completed && styles.titleDone]}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>{item.subtitle}</Text>
        ) : null}
      </View>

      {/* Check */}
      <Ionicons
        name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={item.completed ? t.success : t.border}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  title: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
