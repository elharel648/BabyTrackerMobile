import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';
import { useEvents } from '../../src/context/EventsProvider';
import { useSleepStats } from '../../src/context/hooks/useSleepStats';

export default function DataScreen() {
  const { events } = useEvents();
  const { totalLast24, dailyGraph } = useSleepStats(events);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>נתונים</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>שינה – 24 שעות אחרונות</Text>
        <Text style={styles.value}>{totalLast24.toFixed(1)} שעות</Text>

        {dailyGraph.length > 0 ? (
          <View style={styles.chartWrapper}>
            <VictoryChart
              height={200}
              padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
            >
              <VictoryAxis
                style={{ tickLabels: { fontSize: 10 } }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${t}h`}
                style={{ tickLabels: { fontSize: 10 } }}
              />
              <VictoryLine data={dailyGraph} />
            </VictoryChart>
          </View>
        ) : (
          <Text style={styles.emptyText}>
            כדי לראות גרף צריך לפחות מקטע שינה אחד בשבוע האחרון.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#0D1520', // רקע כהה בסגנון האפליקציה שהראית
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#111827',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 4,
    color: '#E5E7EB',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 12,
    color: '#38BDF8',
  },
  chartWrapper: {
    marginTop: 4,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'right',
  },
});
