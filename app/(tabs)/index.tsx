import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const quickActions = [
  { label: 'Log Feed', icon: 'restaurant' as const },
  { label: 'Log Sleep', icon: 'moon' as const },
  { label: 'Log Diaper', icon: 'water' as const },
];

export default function HomeScreen() {
  const handleAction = (label: string) => {
    if (Alert.alert) {
      Alert.alert(label, 'Action coming soon');
    } else {
      console.log(`Action selected: ${label}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi, Alma&apos;s dad 👋</Text>
        <Text style={styles.subtext}>Here&apos;s today&apos;s snapshot</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.iconCircle, styles.sleepCircle]}>
              <Ionicons name="moon" size={20} color="#fff" />
            </View>
            <Text style={styles.summaryLabel}>Sleep</Text>
            <Text style={styles.summaryValue}>7h 45m</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.iconCircle, styles.feedCircle]}>
              <Ionicons name="restaurant" size={20} color="#fff" />
            </View>
            <Text style={styles.summaryLabel}>Feeds</Text>
            <Text style={styles.summaryValue}>5</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.iconCircle, styles.diaperCircle]}>
              <Ionicons name="water" size={20} color="#fff" />
            </View>
            <Text style={styles.summaryLabel}>Diapers</Text>
            <Text style={styles.summaryValue}>6</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => handleAction(action.label)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <View style={styles.actionIconWrapper}>
                <Ionicons name={action.icon} size={22} color="#4B5563" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: '#F7F8FB',
  },
  header: {
    gap: 6,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtext: {
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepCircle: {
    backgroundColor: '#6366F1',
  },
  feedCircle: {
    backgroundColor: '#F59E0B',
  },
  diaperCircle: {
    backgroundColor: '#10B981',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonPressed: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  actionIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
