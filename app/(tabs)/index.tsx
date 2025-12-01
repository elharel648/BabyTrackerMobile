import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type QuickAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type SummaryStat = {
  label: string;
  value: string;
};

const quickActions: QuickAction[] = [
  { label: 'Log feed', icon: 'restaurant' },
  { label: 'Log sleep', icon: 'moon' },
  { label: 'Log diaper', icon: 'water' },
];

const todayStats: SummaryStat[] = [
  { label: 'Total sleep', value: '11h 20m' },
  { label: 'Feeds', value: '6' },
  { label: 'Diapers', value: '5' },
];

export default function HomeScreen() {
  const handleAction = (label: string) => {
    Alert.alert(label, 'Action coming soon');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.greeting}>Hi, Alma&apos;s dad 👋</Text>
          <Text style={styles.subtitle}>Here&apos;s how today is going</Text>
        </View>
        <View style={styles.badge}>
          <View style={styles.badgeIconCircle}>
            <Ionicons name="heart" size={18} color="#f472b6" />
          </View>
          <Text style={styles.badgeText}>Alma</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <View style={styles.summaryRow}>
          {todayStats.map((stat) => (
            <View key={stat.label} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{stat.label}</Text>
              <Text style={styles.summaryValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => handleAction(action.label)}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name={action.icon} size={24} color="#f9fafb" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today timeline</Text>
        <Text style={styles.timelineText}>
          Soon you&apos;ll see a timeline of Alma&apos;s sleep, feeds and diaper changes here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#020617',
  },
  container: {
    padding: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerTextGroup: {
    flex: 1,
    gap: 6,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  badge: {
    backgroundColor: '#0f172a',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  badgeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  badgeText: {
    color: '#f9fafb',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    gap: 16,
  },
  cardTitle: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#0b1120',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 6,
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  summaryValue: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0b1120',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  actionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  actionLabel: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timelineText: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
});
