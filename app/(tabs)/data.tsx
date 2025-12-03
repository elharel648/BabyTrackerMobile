import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    LayoutAnimation,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
// import { VictoryBar, VictoryChart, VictoryAxis, VictoryGroup } from 'victory-native'; // נפתח במובייל

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Shadows } from '../../constants/theme';
import { useEvents } from '../../src/context/EventsProvider';

// הפעלת אנימציות
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_WIDTH = Dimensions.get('window').width;

// טווחי זמן
type TimeRange = 'today' | 'week' | 'month';

export default function DataScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { events } = useEvents(); // כאן נשתמש בנתונים האמיתיים בהמשך
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');

  // --- דאטה מדומה לגרפים (בהמשך נחבר ל-Events האמיתיים) ---
  const chartData = [
    { day: 'א', sleep: 14, feed: 8 },
    { day: 'ב', sleep: 13.5, feed: 7 },
    { day: 'ג', sleep: 15, feed: 9 },
    { day: 'ד', sleep: 12, feed: 8 },
    { day: 'ה', sleep: 14, feed: 7 },
    { day: 'ו', sleep: 16, feed: 6 },
    { day: 'ש', sleep: 15, feed: 8 },
  ];

  // --- פונקציות עזר ---
  const handleRangeChange = (range: TimeRange) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedRange(range);
  };

  // --- רכיבים פנימיים ---

  const StatCard = ({ title, value, unit, icon, color, bg }: any) => (
    <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.small]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.statTitle, { color: theme.textMuted }]}>{title}</Text>
      </View>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.statUnit, { color: theme.textMuted }]}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* כותרת */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>נתונים ומגמות</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>סיכום הפעילות של עלמה</Text>
        </View>

        {/* פילטר זמנים (Segmented Control) */}
        <View style={[styles.segmentContainer, { backgroundColor: '#E2E8F0' }]}>
          {(['today', 'week', 'month'] as TimeRange[]).map((range) => {
            const isActive = selectedRange === range;
            const label = range === 'today' ? 'היום' : range === 'week' ? 'שבוע' : 'חודש';
            
            return (
              <Pressable
                key={range}
                onPress={() => handleRangeChange(range)}
                style={[
                  styles.segmentButton,
                  isActive && [styles.activeSegment, Shadows.small, { backgroundColor: theme.card }]
                ]}
              >
                <Text style={[
                  styles.segmentText, 
                  { color: isActive ? theme.tint : theme.textMuted, fontWeight: isActive ? '700' : '500' }
                ]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* גרף ראשי */}
        <View style={[styles.chartCard, { backgroundColor: theme.card }, Shadows.card]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>שעות שינה</Text>
            <View style={[styles.trendBadge, { backgroundColor: theme.eventSleepBg }]}>
              <Ionicons name="arrow-up" size={12} color={theme.eventSleep} />
              <Text style={[styles.trendText, { color: theme.eventSleep }]}>+1.2 ש'</Text>
            </View>
          </View>

          {/* Placeholder לגרף (למניעת קריסה ב-Web, במובייל נחליף ל-Victory) */}
          <View style={styles.chartPlaceholder}>
            {chartData.map((d, i) => (
              <View key={i} style={styles.barWrapper}>
                <View style={[styles.bar, { height: d.sleep * 5, backgroundColor: theme.eventSleep }]} />
                <Text style={[styles.barLabel, { color: theme.textMuted }]}>{d.day}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.chartFooter}>ממוצע שבועי: 14.2 שעות ביממה</Text>
        </View>

        {/* גריד סטטיסטיקה */}
        <View style={styles.statsGrid}>
          <StatCard 
            title="שינה ממוצעת" 
            value="14.2" 
            unit="שעות" 
            icon="moon" 
            color={theme.eventSleep} 
            bg={theme.eventSleepBg} 
          />
          <StatCard 
            title="בקבוקים ביום" 
            value="7.5" 
            unit="ממוצע" 
            icon="restaurant" 
            color={theme.eventFeed} 
            bg={theme.eventFeedBg} 
          />
          <StatCard 
            title="חיתולים" 
            value="42" 
            unit="השבוע" 
            icon="water" 
            color={theme.eventDiaper} 
            bg={theme.eventDiaperBg} 
          />
          <StatCard 
            title="זמן איכות" 
            value="3.5" 
            unit="שעות" 
            icon="heart" 
            color="#FF7675" 
            bg="#FFEAEA" 
          />
        </View>

        {/* היסטוריה קצרה */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>פירוט לפי ימים</Text>
        <View style={[styles.historyContainer, { backgroundColor: theme.card }, Shadows.small]}>
          {[1, 2, 3].map((item, index) => (
            <View key={index} style={[
              styles.historyRow, 
              index !== 2 && { borderBottomWidth: 1, borderBottomColor: theme.border }
            ]}>
              <View>
                <Text style={[styles.historyDate, { color: theme.text }]}>יום רביעי, 3 דצמ'</Text>
                <Text style={[styles.historySub, { color: theme.textMuted }]}>יום רגוע בבית</Text>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.miniStat}>
                  <Ionicons name="moon" size={12} color={theme.textMuted} />
                  <Text style={[styles.miniStatText, { color: theme.text }]}>14h</Text>
                </View>
                <View style={styles.miniStat}>
                  <Ionicons name="restaurant" size={12} color={theme.textMuted} />
                  <Text style={[styles.miniStatText, { color: theme.text }]}>8</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', textAlign: 'left' },
  headerSubtitle: { fontSize: 16, marginTop: 4, textAlign: 'left' },

  // Segment Control
  segmentContainer: {
    flexDirection: 'row-reverse',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    height: 44,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeSegment: {
    
  },
  segmentText: { fontSize: 14 },

  // Charts
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  trendBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: { fontSize: 12, fontWeight: '700' },
  
  // Custom Bar Chart (Simple)
  chartPlaceholder: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  barWrapper: { alignItems: 'center', gap: 6 },
  bar: { width: 12, borderRadius: 6 },
  barLabel: { fontSize: 12 },
  chartFooter: { textAlign: 'center', fontSize: 12, color: '#999', marginTop: 8 },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%', // 2 columns
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  statHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  iconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statTitle: { fontSize: 13, fontWeight: '500' },
  statValueRow: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statUnit: { fontSize: 12 },

  // History List
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'left' },
  historyContainer: { borderRadius: 16, overflow: 'hidden' },
  historyRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  historyDate: { fontSize: 15, fontWeight: '600', textAlign: 'left' },
  historySub: { fontSize: 13, marginTop: 2, textAlign: 'left' },
  historyStats: { flexDirection: 'row-reverse', gap: 12 },
  miniStat: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  miniStatText: { fontSize: 13, fontWeight: '600' },
});