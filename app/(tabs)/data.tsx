import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { Colors, Shadows } from '../../constants/theme';
import { useBabyStats } from '../../src/context/hooks/useBabyStats';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const StatWidget: React.FC<{ title: string; value: string | number; icon: any; color: string; bgColor: string; unit?: string; isTime?: boolean }> = ({ title, value, icon, color, bgColor, unit, isTime }) => {
  const theme = Colors[useColorScheme() ?? 'light'];
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.small]}>
      <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>
        {isTime ? value : typeof value === 'number' ? value.toFixed(1) : value}
        {unit && <Text style={{fontSize: 14}}>{unit}</Text>}
      </Text>
      <Text style={[styles.statTitle, { color: theme.textMuted }]}>{title}</Text>
    </View>
  );
};

const formatDuration = (m: number) => {
    if (!m) return '---';
    const h = Math.floor(m / 60);
    const min = Math.round(m % 60);
    return h > 0 ? `${h} ש' ${min} דק'` : `${min} דק'`;
};

export default function DataScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  
  // 🔥 שליפה בטוחה למניעת קריסה 🔥
  const { 
      todayStats, 
      dailyStats, 
      averageDiapersPerDay = 0, 
      averageFeedsPerDay = 0, 
      averageSleepMinutesPerDay = 0
  } = useBabyStats();

  const weeklyStats = useMemo(() => dailyStats.slice(0, 7), [dailyStats]);
  const aiSummary = "*המערכת אוספת נתונים לניתוח...*";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 20, textAlign: 'left', color: theme.text }}>תובנות נתונים</Text>
        
        <View style={[styles.aiCard, { backgroundColor: theme.card, borderColor: theme.tint }, Shadows.medium]}>
            <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={28} color={theme.tint} />
                <Text style={[styles.aiTitle, { color: theme.text }]}>סיכום שבועי חכם</Text>
            </View>
            <Text style={[styles.aiSummary, { color: theme.textMuted }]}>{aiSummary}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>סיכום היום</Text>
        <View style={styles.statsGrid}>
          <StatWidget title="שינה" value={formatDuration(todayStats.totalSleepMinutes)} icon="moon" color={theme.eventSleep} bgColor={theme.eventSleepBg} isTime />
          <StatWidget title="ארוחות" value={todayStats.feedCount} icon="restaurant" color={theme.eventFeed} bgColor={theme.eventFeedBg} />
          <StatWidget title="חיתולים" value={todayStats.diaperCount} icon="water" color={theme.eventDiaper} bgColor={theme.eventDiaperBg} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>ממוצעים</Text>
        <View style={styles.statsGrid}>
          <StatWidget title="ממוצע שינה" value={formatDuration(averageSleepMinutesPerDay)} icon="time" color={theme.tint} bgColor={theme.tint + '20'} isTime />
          <StatWidget title="ממוצע ארוחות" value={averageFeedsPerDay} icon="stats-chart" color={theme.eventFeed} bgColor={theme.eventFeedBg} />
          <StatWidget title="ממוצע חיתולים" value={averageDiapersPerDay} icon="stats-chart" color={theme.eventDiaper} bgColor={theme.eventDiaperBg} />
        </View>
        
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>מגמת שינה שבועית</Text>
        <View style={[styles.chartContainer, { backgroundColor: theme.card }, Shadows.card]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>משך שינה (שעות) לפי יום</Text>
            <Ionicons name="bar-chart-outline" size={20} color={theme.tint} />
          </View>
          <View style={styles.barChartPlaceholder}>
             {weeklyStats.map((day, index) => {
               const sleepHours = day.totalSleepMinutes / 60;
               const heightPercent = (sleepHours / 12) * 100;
               const barHeight = Math.min(100, heightPercent);
               return (
               <View key={day.date} style={styles.barWrapper}>
                 <Text style={[styles.barValue, { color: theme.textMuted, fontSize: 11 }]}>
                    {sleepHours.toFixed(1)}
                 </Text>
                 <View style={[styles.bar, { height: `${barHeight}%`, backgroundColor: theme.eventSleep }]} />
                 <Text style={[styles.barLabel, { color: theme.textMuted }]}>
                   {new Date(day.date).getDate()}
                 </Text>
               </View>
             )})}
             {weeklyStats.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.barWrapper}>
                   <View style={[styles.bar, {height: '30%', backgroundColor: theme.eventSleep, opacity: 0.3}]} />
                   <Text style={[styles.barLabel, { color: theme.textMuted }]}>-</Text>
                </View>
             ))}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'left' },
  statsGrid: { flexDirection: 'row-reverse', gap: 12, flexWrap: 'wrap' },
  statCard: { width: '48%', borderRadius: 18, padding: 16, alignItems: 'flex-end', minHeight: 110 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statTitle: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  aiCard: { borderRadius: 16, padding: 16, marginBottom: 28, borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderBottomWidth: 5 },
  aiHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 10 },
  aiTitle: { fontSize: 18, fontWeight: '800' },
  aiSummary: { fontSize: 14, textAlign: 'right', marginBottom: 15, paddingHorizontal: 5, lineHeight: 22 },
  chartContainer: { borderRadius: 20, padding: 16, marginBottom: 28 },
  chartHeader: { width: '100%', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  chartTitle: { fontSize: 18, fontWeight: '700' },
  barChartPlaceholder: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 150, paddingHorizontal: 10, gap: 8, width: '100%' },
  barWrapper: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  bar: { width: 25, borderRadius: 4, marginBottom: 4 },
  barLabel: { fontSize: 12, fontWeight: '600' },
  barValue: { marginBottom: 2 },
});