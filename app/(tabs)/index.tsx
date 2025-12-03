import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
// הסרנו זמנית את victory-native כי הוא גורם לקריסה ב-Web
// import { VictoryBar, VictoryChart, VictoryAxis } from 'victory-native'; 

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Shadows } from '../../constants/theme';
import {
  TimelineEntryType,
  useEvents
} from '../../src/context/EventsProvider';

// הפעלת אנימציות באנדרואיד
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BABY_DOB = new Date('2024-06-01'); // תאריך לידה (דוגמה)

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { events, addEntry, removeEntry } = useEvents();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // --- לוגיקה וחישובים ---

  const sortedEvents = useMemo(() => [...events].sort((a, b) => b.timestamp - a.timestamp), [events]);
  
  const lastSleep = sortedEvents.find(e => e.type === 'sleep' || e.type === 'wake');
  const lastFeed = sortedEvents.find(e => e.type === 'feed');
  const lastDiaper = sortedEvents.find(e => e.type === 'diaper');

  const isSleeping = lastSleep?.type === 'sleep';

  const minutesSinceSleep = lastSleep ? Math.floor((now.getTime() - lastSleep.timestamp) / 60000) : 0;
  const minutesSinceFeed = lastFeed ? Math.floor((now.getTime() - lastFeed.timestamp) / 60000) : 0;
  const minutesSinceDiaper = lastDiaper ? Math.floor((now.getTime() - lastDiaper.timestamp) / 60000) : 0;

  const todayStats = useMemo(() => {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const todayEvents = events.filter(e => e.timestamp >= startOfDay.getTime());

    return {
      feeds: todayEvents.filter(e => e.type === 'feed').length,
      diapers: todayEvents.filter(e => e.type === 'diaper').length,
      sleeps: todayEvents.filter(e => e.type === 'sleep').length,
    };
  }, [events, now]);

  // ברכה חכמה
  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h >= 5 && h < 12) return 'בוקר טוב';
    if (h >= 12 && h < 18) return 'אחר הצהריים טובים';
    if (h >= 18 && h < 22) return 'ערב טוב';
    return 'לילה טוב';
  }, [now]);

  // --- פונקציות עזר ---

  const formatDurationSimple = (minutes: number) => {
    if (minutes < 60) return `${minutes} דק'`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} ש' ${m} דק'`;
  };

  const handleAddEvent = (type: TimelineEntryType, label: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    addEntry({
      id: Date.now().toString(),
      type,
      label,
      time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    });
    if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('מחיקה', 'למחוק את האירוע?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        removeEntry(id);
      }}
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateText, { color: theme.textMuted }]}>
              {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={[styles.greetingText, { color: theme.text }]}>{greeting}, אבא</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.avatarRing, { borderColor: theme.tint }]}>
              <Text style={{ fontSize: 22 }}>👶</Text>
            </View>
          </View>
        </View>

        {/* --- HERO CARD --- */}
        <LinearGradient
          colors={isSleeping 
            ? ['#2C3E50', '#4CA1AF'] 
            : [theme.heroGradientStart, theme.heroGradientEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, Shadows.medium]}
        >
          <Ionicons 
            name={isSleeping ? "moon" : "sunny"} 
            size={120} 
            color="rgba(255,255,255,0.1)" 
            style={styles.heroBgIcon} 
          />

          <View style={styles.heroTop}>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: isSleeping ? '#818CF8' : '#4ADE80' }]} />
              <Text style={styles.liveText}>{isSleeping ? 'בשינה' : 'ערה'}</Text>
            </View>
            <Text style={styles.babyName}>עלמה</Text>
          </View>

          <View style={styles.heroMain}>
            <Text style={styles.timerText}>
              {Math.floor(minutesSinceSleep / 60)}
              <Text style={styles.timerUnit}>ש'</Text>
              {' : '}
              {String(minutesSinceSleep % 60).padStart(2, '0')}
              <Text style={styles.timerUnit}>דק'</Text>
            </Text>
            <Text style={styles.timerLabel}>
              {isSleeping ? 'משך השינה הנוכחית' : 'זמן ערות רצוף'}
            </Text>
          </View>
        </LinearGradient>

        {/* --- DASHBOARD WIDGETS --- */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.small]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.eventSleepBg }]}>
              <Ionicons name="moon" size={20} color={theme.eventSleep} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{todayStats.sleeps}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>שינות היום</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.small]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.eventFeedBg }]}>
              <Ionicons name="restaurant" size={20} color={theme.eventFeed} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{todayStats.feeds}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>ארוחות</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.small]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.eventDiaperBg }]}>
              <Ionicons name="water" size={20} color={theme.eventDiaper} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{todayStats.diapers}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>חיתולים</Text>
          </View>
        </View>

        {/* --- ACTIONS --- */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>עדכון מהיר</Text>
        
        <View style={styles.smartActionsContainer}>
          <Pressable
            style={({pressed}) => [
              styles.bigActionBtn,
              { backgroundColor: isSleeping ? '#6366F1' : theme.heroGradientStart, opacity: pressed ? 0.9 : 1 },
              Shadows.medium
            ]}
            onPress={() => handleAddEvent(isSleeping ? 'wake' : 'sleep', isSleeping ? 'התעוררה' : 'הלכה לישון')}
          >
            <View style={styles.actionContent}>
              <Ionicons name={isSleeping ? "sunny" : "moon"} size={32} color="#FFF" />
              <View>
                <Text style={styles.bigActionTitle}>{isSleeping ? 'התעוררה' : 'לישון'}</Text>
                <Text style={styles.bigActionSub}>לחץ לשינוי סטטוס</Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.secondaryActionsRow}>
            <Pressable 
              style={({pressed}) => [styles.mediumActionBtn, { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 }, Shadows.small]}
              onPress={() => handleAddEvent('feed', 'אוכל')}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: theme.eventFeedBg }]}>
                <Ionicons name="restaurant" size={20} color={theme.eventFeed} />
              </View>
              <Text style={[styles.mediumActionLabel, { color: theme.text }]}>אוכל</Text>
              <Text style={[styles.mediumActionTimer, { color: theme.textMuted }]}>
                לפני {formatDurationSimple(minutesSinceFeed)}
              </Text>
            </Pressable>

            <Pressable 
              style={({pressed}) => [styles.mediumActionBtn, { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 }, Shadows.small]}
              onPress={() => handleAddEvent('diaper', 'חיתול')}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: theme.eventDiaperBg }]}>
                <Ionicons name="water" size={20} color={theme.eventDiaper} />
              </View>
              <Text style={[styles.mediumActionLabel, { color: theme.text }]}>חיתול</Text>
              <Text style={[styles.mediumActionTimer, { color: theme.textMuted }]}>
                לפני {formatDurationSimple(minutesSinceDiaper)}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* --- WEEKLY TREND CHART PLACEHOLDER --- */}
        <View style={[styles.chartContainer, { backgroundColor: theme.card }, Shadows.card]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>מגמת אכילה שבועית</Text>
            <Ionicons name="stats-chart" size={18} color={theme.tint} />
          </View>
          
          {/* פלייס-הולדר לגרף כדי שלא יקרוס ב-Web */}
          <View style={styles.chartPlaceholder}>
             <View style={[styles.bar, {height: 40, backgroundColor: theme.eventFeed}]} />
             <View style={[styles.bar, {height: 60, backgroundColor: theme.eventFeed}]} />
             <View style={[styles.bar, {height: 50, backgroundColor: theme.eventFeed}]} />
             <View style={[styles.bar, {height: 80, backgroundColor: theme.eventFeed}]} />
             <View style={[styles.bar, {height: 30, backgroundColor: theme.eventFeed}]} />
          </View>
          <Text style={{fontSize: 10, color: theme.textMuted, marginTop: 8}}>גרף מלא זמין באפליקציית מובייל</Text>
        </View>

        {/* --- RECENT ACTIVITY --- */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 10 }]}>פעילות אחרונה</Text>
        <View style={styles.listContainer}>
          {sortedEvents.slice(0, 5).map((item, index) => {
            let dotColor = theme.textLight;
            let iconName: any = 'ellipse';
            if (item.type === 'feed') { dotColor = theme.eventFeed; iconName = 'restaurant'; }
            if (item.type === 'sleep') { dotColor = theme.eventSleep; iconName = 'moon'; }
            if (item.type === 'wake') { dotColor = theme.success; iconName = 'sunny'; }
            if (item.type === 'diaper') { dotColor = theme.eventDiaper; iconName = 'water'; }

            return (
              <Pressable 
                key={item.id} 
                onLongPress={() => handleDelete(item.id)}
                style={({pressed}) => [styles.listItem, { opacity: pressed ? 0.7 : 1 }]}
              >
                <View style={styles.listItemTime}>
                  <Text style={[styles.timeText, { color: theme.textMuted }]}>{item.time}</Text>
                </View>
                
                <View style={styles.listItemIndicator}>
                  <View style={[styles.indicatorLine, { backgroundColor: index === sortedEvents.length -1 ? 'transparent' : theme.border }]} />
                  <View style={[styles.indicatorDot, { backgroundColor: theme.card, borderColor: dotColor }]}>
                    <Ionicons name={iconName} size={10} color={dotColor} />
                  </View>
                </View>

                <View style={[styles.listItemContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.itemLabel, { color: theme.text }]}>{item.label}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  
  // Header
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: { fontSize: 13, textAlign: 'left', fontWeight: '500' },
  greetingText: { fontSize: 22, fontWeight: '700', textAlign: 'left' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: { 
    width: 46, height: 46, borderRadius: 23, borderWidth: 2, 
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' 
  },

  // Hero
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    height: 180,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.15,
  },
  heroTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  babyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  liveBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  
  heroMain: { alignItems: 'center' },
  timerText: { fontSize: 42, fontWeight: '700', color: '#FFF', fontVariant: ['tabular-nums'] },
  timerUnit: { fontSize: 18, fontWeight: '400' },
  timerLabel: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: -4 },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  statNumber: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12 },

  // Smart Actions
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'left' },
  smartActionsContainer: { gap: 12, marginBottom: 28 },
  
  bigActionBtn: {
    flexDirection: 'row-reverse',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  bigActionTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', textAlign: 'left' },
  bigActionSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'left' },

  secondaryActionsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  mediumActionBtn: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'flex-start', // Align text to left/start
    justifyContent: 'space-between',
    height: 100,
  },
  actionIconBadge: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'flex-end', // Icon on right
  },
  mediumActionLabel: { fontSize: 16, fontWeight: '700', textAlign: 'left', width: '100%' },
  mediumActionTimer: { fontSize: 12, marginTop: 2, textAlign: 'left', width: '100%' },

  // Chart
  chartContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
    alignItems: 'center',
  },
  chartHeader: {
    width: '100%',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  chartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    height: 100,
  },
  bar: {
    width: 20,
    borderRadius: 4,
  },

  // List
  listContainer: { gap: 0 },
  listItem: {
    flexDirection: 'row-reverse',
    height: 50,
  },
  listItemTime: {
    width: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeText: { fontSize: 12, fontWeight: '600' },
  listItemIndicator: {
    width: 30,
    alignItems: 'center',
  },
  indicatorLine: {
    width: 2,
    height: '100%',
    position: 'absolute',
  },
  indicatorDot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2,
    marginTop: 16,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  listItemContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  itemLabel: { fontSize: 15, fontWeight: '500', textAlign: 'left' },
});