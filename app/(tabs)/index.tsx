import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  TimelineEntry as TimelineEntryModel,
  useEvents,
} from '../../src/context/EventsProvider';

type QuickActionId = 'feed' | 'sleep' | 'diaper';

type QuickAction = {
  id: QuickActionId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type SummaryStat = {
  label: string;
  value: string;
};

// כרגע – תמיד עברית + RTL. אחר כך נוסיף הגדרת שפה + מצב כהה/בהיר.
const quickActions: QuickAction[] = [
  { id: 'feed', label: 'הוספת האכלה', icon: 'restaurant' },
  { id: 'sleep', label: 'הוספת שינה', icon: 'moon' },
  { id: 'diaper', label: 'החלפת חיתול', icon: 'water' },
];

// אפשר לעדכן לתאריך הלידה האמיתי
const BABY_DOB = new Date('2024-01-01');

const HomeScreen: React.FC = () => {
  const { timeline, addEntry } = useEvents();

  const [now, setNow] = useState<Date>(new Date());
  const [lastFeedAt, setLastFeedAt] = useState<number | null>(null);
  const [lastSleepAt, setLastSleepAt] = useState<number | null>(null);
  const [lastDiaperAt, setLastDiaperAt] = useState<number | null>(null);

  // שעון – מתעדכן כל דקה
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleQuickAction = (action: QuickAction) => {
    const nowDate = new Date();
    const nowMs = nowDate.getTime();
    const timeString = nowDate.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const label =
      action.id === 'feed'
        ? 'נרשמה האכלה'
        : action.id === 'sleep'
        ? 'נרשמה שינה'
        : 'נרשמה החלפת חיתול';

    const newEntry: TimelineEntryModel = {
      id: `${nowMs}-${action.id}`,
      type: action.id,
      label,
      time: timeString,
      timestamp: nowMs,
    };

    addEntry(newEntry);

    if (action.id === 'feed') {
      setLastFeedAt(nowMs);
    } else if (action.id === 'sleep') {
      // כרגע מפרשים "הוספת שינה" כסיום שינה – מאז היא ערה
      setLastSleepAt(nowMs);
    } else if (action.id === 'diaper') {
      setLastDiaperAt(nowMs);
    }

    Alert.alert(action.label, 'הפעולה נוספה לציר הזמן של היום 👍');
  };

  const hasTimeline = useMemo(() => timeline.length > 0, [timeline]);

  // כמה זמן היא ערה מאז השינה האחרונה
  const awakeDurationMs = useMemo(() => {
    if (!lastSleepAt) return null;
    return now.getTime() - lastSleepAt;
  }, [now, lastSleepAt]);

  const awakeDurationLabel = useMemo(() => {
    if (!awakeDurationMs) return 'עדיין לא נרשמה שינה';
    return formatDuration(awakeDurationMs) + ' ערות';
  }, [awakeDurationMs]);

  const babyStateLabel = useMemo(() => {
    if (!awakeDurationMs) return 'ממתינים לרישום שינה ראשון';
    const hours = awakeDurationMs / 3_600_000;

    if (hours < 1) return 'נינוחה ושמחה 😌';
    if (hours < 2) return 'ערה ובמצב טוב 🙂';
    if (hours < 3) return 'מתחילה להתעייף 🥱';
    return 'עייפות יתר 😵‍💫';
  }, [awakeDurationMs]);

  const recommendedActionLabel = useMemo(() => {
    if (!awakeDurationMs) {
      return 'התחל במעקב – רשום שינה, האכלה או חיתול ראשון היום.';
    }
    const hours = awakeDurationMs / 3_600_000;

    if (hours < 1) {
      return 'זמן משחק רגוע, מגע, שיחה וחיוכים 🧸';
    }
    if (hours < 2) {
      return 'שקול להוריד גירויים ולהתכונן לשינה הבאה 😴';
    }
    if (hours < 3) {
      return 'מומלץ להציע שינה בהקדם כדי למנוע עייפות יתר 💤';
    }
    return 'נסו להרגיע את הסביבה, להחשיך מעט ולהציע שינה כמה שיותר מהר 🤍';
  }, [awakeDurationMs]);

  // גיל בחודשים
  const babyAgeLabel = useMemo(() => {
    const diffMs = now.getTime() - BABY_DOB.getTime();
    const months = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30)), 0);
    if (months <= 0) return 'יילודה';
    if (months === 1) return 'חודש';
    return `${months} חודשים`;
  }, [now]);

  // סטטיסטיקות מהטיימליין
  const feedCount = useMemo(
    () => timeline.filter(e => e.type === 'feed').length,
    [timeline],
  );
  const diaperCount = useMemo(
    () => timeline.filter(e => e.type === 'diaper').length,
    [timeline],
  );
  const sleepCount = useMemo(
    () => timeline.filter(e => e.type === 'sleep').length,
    [timeline],
  );

  const todayStats: SummaryStat[] = useMemo(
    () => [
      { label: 'שעות שינה', value: '—' }, // נחשב בהמשך כשיהיו סשנים אמיתיים
      { label: 'האכלות', value: String(feedCount) },
      { label: 'חיתולים', value: String(diaperCount) },
    ],
    [feedCount, diaperCount],
  );

  const lastEvent = useMemo(
    () => (timeline.length ? timeline[0] : null),
    [timeline],
  );

  const timeSinceLastEventLabel = useMemo(() => {
    if (!lastEvent) return 'אין אירועים היום עדיין';
    const diff = now.getTime() - lastEvent.timestamp;
    return `${formatDuration(diff)} מהאירוע האחרון`;
  }, [lastEvent, now]);

  const dayOverviewLabel = useMemo(() => {
    if (!timeline.length) {
      return 'היום עוד לא התחיל – כל האירועים שתוסיף יופיעו כאן.';
    }
    return `היום נרשמו ${feedCount} האכלות, ${diaperCount} חיתולים ו־${sleepCount} פרקי שינה.`;
  }, [timeline.length, feedCount, diaperCount, sleepCount]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO עליון – עלמה + שעון + כותרת */}
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={['#6366f1', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroBabyPill}>
              <View style={styles.heroBabyAvatar}>
                <Text style={styles.heroBabyInitial}>א</Text>
              </View>
              <View style={styles.heroBabyTextBlock}>
                <Text style={styles.heroBabyName}>עלמה</Text>
                <Text style={styles.heroBabyAge}>{babyAgeLabel}</Text>
              </View>
            </View>

            <View style={styles.heroClockBlock}>
              <Text style={styles.heroClockTime}>{formatClockTime(now)}</Text>
              <Text style={styles.heroClockDate}>{formatDateLine(now)}</Text>
            </View>
          </View>

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroGreeting}>היי, אבא של עלמה 👋</Text>
            <Text style={styles.heroSubtitle}>
              כאן תראה את היום של עלמה במבט אחד
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* כרטיס סטטוס עלמה */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeaderRow}>
          <View style={styles.statusTitleRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusTitle}>הסטטוס של עלמה</Text>
          </View>
          <Text style={styles.statusState}>{babyStateLabel}</Text>
        </View>

        <View style={styles.statusMetricsRow}>
          <View style={styles.statusMetric}>
            <Text style={styles.statusMetricLabel}>ערות</Text>
            <Text style={styles.statusMetricValue}>{awakeDurationLabel}</Text>
          </View>
          <View style={styles.statusMetric}>
            <Text style={styles.statusMetricLabel}>האכלה אחרונה</Text>
            <Text style={styles.statusMetricValue}>
              {lastFeedAt ? formatShortTime(lastFeedAt) : 'לא נרשמה'}
            </Text>
          </View>
          <View style={styles.statusMetric}>
            <Text style={styles.statusMetricLabel}>חיתול אחרון</Text>
            <Text style={styles.statusMetricValue}>
              {lastDiaperAt ? formatShortTime(lastDiaperAt) : 'לא נרשם'}
            </Text>
          </View>
        </View>
      </View>

      {/* פוקוס כרגע – מה מומלץ לעשות */}
      <View style={styles.focusCard}>
        <View style={styles.focusHeaderRow}>
          <Text style={styles.focusTitle}>פוקוס כרגע</Text>
          <View style={styles.chip}>
            <Ionicons name="sparkles" size={14} color="#4f46e5" />
            <Text style={styles.chipText}>{timeSinceLastEventLabel}</Text>
          </View>
        </View>
        <Text style={styles.focusBody}>{recommendedActionLabel}</Text>
      </View>

      {/* סיכום היום בקצרה */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>היום בקצרה</Text>
          <Text style={styles.cardSubtitle}>{dayOverviewLabel}</Text>
        </View>
        <View style={styles.summaryRow}>
          {todayStats.map(stat => (
            <View key={stat.label} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{stat.label}</Text>
              <Text style={styles.summaryValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* פעולות מהירות */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>פעולות מהירות</Text>
        <Text style={styles.cardSubtitle}>
          הוסף בלחיצה אחת אירועי היום – האכלה, שינה או החלפת חיתול.
        </Text>
        <View style={styles.actionsRow}>
          {quickActions.map(action => (
            <Pressable
              key={action.id}
              onPress={() => handleQuickAction(action)}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <View style={styles.actionIconCircle}>
                <Ionicons name={action.icon} size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ציר זמן של היום */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ציר הזמן של היום</Text>
        {hasTimeline ? (
          <View style={styles.timelineList}>
            {timeline.map(entry => (
              <View key={entry.id} style={styles.timelineItem}>
                <View style={styles.timelineIconCircle}>
                  <Ionicons
                    name={
                      entry.type === 'feed'
                        ? 'restaurant'
                        : entry.type === 'sleep'
                        ? 'moon'
                        : 'water'
                    }
                    size={18}
                    color="#4f46e5"
                  />
                </View>
                <View style={styles.timelineTextWrapper}>
                  <Text style={styles.timelineLabel}>{entry.label}</Text>
                  <Text style={styles.timelineTime}>{entry.time}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.timelinePlaceholder}>
            התחל בלחיצה על אחת מהפעולות המהירות כדי לבנות את ציר הזמן של
            היום.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

/* ---------- Helpers ---------- */

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateLine(date: Date): string {
  return date.toLocaleDateString('he-IL', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0 && minutes <= 0) return 'הרגע';
  if (hours <= 0) return `${minutes} דק׳`;
  if (hours === 0) return `${minutes} דק׳`;
  if (minutes === 0) return `${hours} ש׳`;
  return `${hours} ש׳ ${minutes} דק׳`;
}

function formatShortTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9', // רקע כללי עדין
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
    direction: 'rtl',
  },

  /* ---------- HERO ---------- */
  heroWrapper: {
    marginBottom: 4,
  },
  heroCard: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroBabyPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
  },
  heroBabyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  heroBabyInitial: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 16,
  },
  heroBabyTextBlock: {
    flexDirection: 'column',
    gap: 2,
  },
  heroBabyName: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroBabyAge: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroClockBlock: {
    alignItems: 'flex-end',
  },
  heroClockTime: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f9fafb',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroClockDate: {
    fontSize: 12,
    color: 'rgba(241, 245, 249, 0.9)',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  heroTextBlock: {
    marginTop: 4,
    gap: 4,
  },
  heroGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f9fafb',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(241, 245, 249, 0.9)',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  /* ---------- STATUS CARD ---------- */
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  statusHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusTitle: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusState: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  statusMetricsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  statusMetric: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  statusMetricLabel: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusMetricValue: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  /* ---------- FOCUS CARD ---------- */
  focusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    gap: 8,
  },
  focusHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focusTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eff6ff',
    gap: 6,
  },
  chipText: {
    color: '#4f46e5',
    fontSize: 11,
    fontWeight: '500',
  },
  focusBody: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  /* ---------- GENERIC CARD ---------- */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    gap: 16,
  },
  cardHeaderRow: {
    gap: 4,
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  /* ---------- TODAY SUMMARY ---------- */
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  summaryValue: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  /* ---------- QUICK ACTIONS ---------- */
  actionsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  actionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    writingDirection: 'rtl',
  },

  /* ---------- TIMELINE ---------- */
  timelineList: {
    gap: 10,
  },
  timelineItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  timelineIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineTextWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timelineLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  timelineTime: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  timelinePlaceholder: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
