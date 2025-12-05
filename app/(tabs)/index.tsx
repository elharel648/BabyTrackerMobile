import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
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

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Shadows } from '../../constants/theme';
import {
  TimelineEntryType,
  useEvents
} from '../../src/context/EventsProvider';
import { useBabyStats } from '../../src/context/hooks/useBabyStats';

// הפעלת אנימציות באנדרואיד
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutLayoutAnimationEnabledExperimental(true);
}

const BABY_DOB = new Date('2024-06-01'); // תאריך לידה (דוגמה)

// --- 🔥 רכיב התראה חכמה 🔥 ---
const PredictionAlert = ({ timeRemainingMinutes, theme, onDismiss }: any) => {
    if (timeRemainingMinutes <= 0) return null;

    const minutes = Math.round(timeRemainingMinutes % 60);
    
    let text = '';
    if (timeRemainingMinutes < 5) {
        text = `חלון השינה נפתח! זמן מעולה להרדמה.`;
    } else if (timeRemainingMinutes < 30) {
        text = `חלון השינה נפתח בעוד כ- ${minutes} דקות!`;
    } else {
        return null; // אם יותר מחצי שעה, לא נציג התראה
    }

    return (
        <View style={[styles.predictionAlert, { backgroundColor: theme.eventSleepBg, borderColor: theme.eventSleep }]}>
            <Ionicons name="alert-circle-outline" size={24} color={theme.eventSleep} />
            <Text style={[styles.predictionText, { color: theme.textMain }]}>{text}</Text>
            <Pressable onPress={onDismiss}>
                <Ionicons name="close-circle-outline" size={20} color={theme.textMuted} />
            </Pressable>
        </View>
    );
}
// ----------------------------

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const { events, addEntry, removeEntry, isSleeping } = useEvents(); 
  const { averageWakeWindowMinutes } = useBabyStats(); 
  const [now, setNow] = useState<Date>(new Date());
  const [showPrediction, setShowPrediction] = useState(true); 

  // הטיימר רץ כל שנייה
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); 
    return () => clearInterval(timer);
  }, []);

  // --- לוגיקה וחישובים ---

  const sortedEvents = useMemo(() => [...events].sort((a, b) => b.timestamp - a.timestamp), [events]);
  
  const lastSleepOrWake = sortedEvents.find(e => e.type === 'sleep' || e.type === 'wake');
  const hasSleepWakeEvents = !!lastSleepOrWake;
  const veryLastEvent = sortedEvents[0];

  // 1. לוגיקת עצירה: הטיימר רץ רק אם הדיווח האחרון הוא sleep או wake
  const isCurrentEventCycle = veryLastEvent?.type === 'sleep' || veryLastEvent?.type === 'wake';
  const isTimerRunning = isCurrentEventCycle && hasSleepWakeEvents;

  // חישוב הזמן בפועל (גם אם לא מוצג כטיימר רץ)
  const totalMillisecondsToDisplay = isTimerRunning && lastSleepOrWake
    ? now.getTime() - lastSleepOrWake.timestamp
    : 0;

  const totalSeconds = Math.floor(totalMillisecondsToDisplay / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  // חישובים עבור כרטיסי האוכל והחיתול (בדקות)
  const lastFeed = sortedEvents.find(e => e.type === 'feed');
  const lastDiaper = sortedEvents.find(e => e.type === 'diaper');
  const minutesSinceFeed = lastFeed ? Math.floor((now.getTime() - lastFeed.timestamp) / 60000) : 0;
  const minutesSinceDiaper = lastDiaper ? Math.floor((now.getTime() - lastDiaper.timestamp) / 60000) : 0;
  
  // נתונים יומיים לסטטיסטיקה
  const todayEvents = useMemo(() => {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return events.filter(e => e.timestamp >= startOfDay.getTime());
  }, [events, now]);
  
  const todayStats = useMemo(() => {
    return {
      feeds: todayEvents.filter(e => e.type === 'feed').length,
      diapers: todayEvents.filter(e => e.type === 'diaper').length,
      sleeps: todayEvents.filter(e => e.type === 'sleep').length,
    };
  }, [todayEvents]);
  
  // לוגיקת החיזוי
  const minutesSinceLastWake = lastSleepOrWake?.type === 'wake' 
      ? (now.getTime() - lastSleepOrWake.timestamp) / (1000 * 60) 
      : 0;

  const timeRemainingUntilSleep = useMemo(() => {
    if (isSleeping || minutesSinceLastWake === 0) return null; 
    
    const remaining = averageWakeWindowMinutes - minutesSinceLastWake;
    return remaining;
  }, [isSleeping, minutesSinceLastWake, averageWakeWindowMinutes]);


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
    if (minutes === undefined || minutes < 0 || isNaN(minutes)) return '---';
    const totalMinutes = Math.round(minutes);
    if (totalMinutes < 60) return `${totalMinutes} דק'`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    if (m === 0) return `${h} שעות`;
    if (h === 0) return `${m} דק'`;
    
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
    setShowPrediction(true); 
  };

  const handleStatusToggle = () => {
      handleAddEvent(isSleeping ? 'wake' : 'sleep', isSleeping ? 'התעוררה' : 'הלכה לישון');
  }

  const handleDelete = (id: string) => {
    Alert.alert('מחיקה', 'למחוק את האירוע?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        removeEntry(id);
      }}
    ]);
  };

  // 4. רכיב Hero Card דינמי לפי מצב
  const isInitialState = !hasSleepWakeEvents && events.length === 0;

  const DynamicHeroContent = () => {
      // 3.1. מצב: התחל מעקב - אם אין אירועים כלל
      if (isInitialState) {
          return (
              <View style={styles.heroMainStart}>
                  <Text style={styles.timerTextStart}>התחילו לעקוב!</Text>
                  <Text style={styles.timerLabelStart}>לחצו כאן כדי להתחיל דיווח ראשון.</Text>
                  <View style={[styles.actionIndicator, { backgroundColor: theme.success }]}>
                    <Ionicons name="play" size={18} color="#FFF" />
                    <Text style={styles.actionIndicatorText}>התחלת מעקב</Text>
                  </View>
              </View>
          );
      }

      // 3.2. מצב: מוכן לפעולה (IDLE) - טיימר עצר
      // אם יש אירועים אבל הטיימר אינו רץ
      if (!isTimerRunning) {
         return (
             <View style={styles.heroMainStart}>
                 <Text style={styles.timerTextStart}>מעקב הסטטוס עצר</Text>
                 <Text style={styles.timerLabelStart}>לחצו כאן כדי להתחיל מחזור חדש</Text>
                 <View style={[styles.actionIndicator, { backgroundColor: theme.tint }]}>
                    <Ionicons name="notifications" size={18} color="#FFF" />
                    <Text style={styles.actionIndicatorText}>דיווח שינה או ערות</Text>
                 </View>
             </View>
         );
      }
      
      // 3.3. מצב: טיימר רץ (ער או ישן)
      return (
          <>
              <View style={styles.heroTop}>
                  <View style={styles.liveBadge}>
                      <View style={[styles.liveDot, { backgroundColor: isSleeping ? '#818CF8' : '#4ADE80' }]} />
                      <Text style={styles.liveText}>{isSleeping ? 'בשינה' : 'ערה'}</Text>
                  </View>
                  <Text style={styles.babyName}>עלמה</Text>
              </View>

              <View style={styles.heroMain}>
                  <Text style={styles.timerText}>
                      {hours}
                      <Text style={styles.timerUnit}>ש'</Text>
                      {' : '}
                      {String(minutes).padStart(2, '0')}
                      <Text style={styles.timerUnit}>דק'</Text>
                      {' : '} 
                      {String(seconds).padStart(2, '0')}
                      <Text style={styles.timerUnit}>שנ'</Text>
                  </Text>
                  <Text style={styles.timerLabel}>
                      {isSleeping ? 'משך השינה הנוכחית' : 'זמן ערות רצוף'}
                  </Text>
              </View>
              
              <View style={styles.actionIndicatorRow}>
                  <View style={[styles.actionIndicator, { backgroundColor: isSleeping ? '#818CF8' : '#4ADE80' }]}>
                      <Ionicons name={isSleeping ? "sunny" : "moon"} size={18} color="#FFF" />
                      <Text style={styles.actionIndicatorText}>
                          {isSleeping ? 'סמן כערה' : 'סמן כשינה'}
                      </Text>
                  </View>
              </View>
          </>
      );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 🔥 התראה חכמה - מוצגת בראש המסך 🔥 */}
        {showPrediction && timeRemainingUntilSleep !== null && !isSleeping && lastSleepOrWake?.type === 'wake' && (
            <PredictionAlert 
                timeRemainingMinutes={timeRemainingUntilSleep} 
                theme={theme}
                onDismiss={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowPrediction(false);
                }}
            />
        )}
        
        {/* 1. --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.dateText, { color: theme.textMuted }]}>
              {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={[styles.greetingText, { color: theme.text }]}>{greeting}, אבא</Text>
          </View>
          
          {/* עוטפים את האווטאר ב-Link לניווט */}
          <Link href="/(tabs)/profile" asChild> 
            <Pressable>
                <View style={styles.headerRight}>
                  <View style={[styles.avatarRing, { borderColor: theme.tint }]}>
                    <Text style={{ fontSize: 22 }}>👶</Text>
                  </View>
                </View>
            </Pressable>
          </Link>
        </View>

        {/* 2. --- HERO CARD (סטטוס ראשי) - אינטראקטיבי */}
        <Pressable 
            onPress={handleStatusToggle} 
            style={({pressed}) => ({ opacity: pressed ? 0.9 : 1 })}
        >
            <LinearGradient
                colors={isSleeping 
                    ? ['#2C3E50', '#4CA1AF'] 
                    : isTimerRunning ? [theme.heroGradientStart, theme.heroGradientEnd] : ['#6B9080', '#A4C3B2']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.heroCard, Shadows.medium]}
            >
                <Ionicons 
                    name={isSleeping ? "moon" : isTimerRunning ? "sunny" : "play"} 
                    size={120} 
                    color="rgba(255,255,255,0.1)" 
                    style={styles.heroBgIcon} 
                />

                <DynamicHeroContent />

            </LinearGradient>
        </Pressable>


        {/* 3. --- ACTIONS (דיווחים מהירים) --- */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>דיווחים מהירים</Text>
        <View style={styles.smartActionsContainer}>

          <View style={styles.secondaryActionsRow}>
            {/* 🔥🔥 לחצן אוכל - מנווט למודאל 🔥🔥 */}
            <Link 
              href={{ pathname: "/modal", params: { eventType: 'feed' } }} 
              asChild
            >
                <Pressable 
                  style={({pressed}) => [styles.mediumActionBtn, { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 }, Shadows.small]}
                >
                  <View style={[styles.actionIconBadge, { backgroundColor: theme.eventFeedBg }]}>
                    <Ionicons name="restaurant" size={20} color={theme.eventFeed} />
                  </View>
                  <Text style={[styles.mediumActionLabel, { color: theme.text }]}>אוכל</Text>
                  <Text style={[styles.mediumActionTimer, { color: theme.textMuted }]}>
                    לפני {formatDurationSimple(minutesSinceFeed)}
                  </Text>
                </Pressable>
            </Link>

            {/* 🔥🔥 לחצן חיתול - מנווט למודאל 🔥🔥 */}
            <Link 
              href={{ pathname: "/modal", params: { eventType: 'diaper' } }} 
              asChild
            >
                <Pressable 
                  style={({pressed}) => [styles.mediumActionBtn, { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 }, Shadows.small]}
                >
                  <View style={[styles.actionIconBadge, { backgroundColor: theme.eventDiaperBg }]}>
                    <Ionicons name="water" size={20} color={theme.eventDiaper} />
                  </View>
                  <Text style={[styles.mediumActionLabel, { color: theme.text }]}>חיתול</Text>
                  <Text style={[styles.mediumActionTimer, { color: theme.textMuted }]}>
                    לפני {formatDurationSimple(minutesSinceDiaper)}
                  </Text>
                </Pressable>
            </Link>
          </View>
        </View>
        
        {/* 4. --- DASHBOARD WIDGETS (סטטיסטיקות יומיות) --- */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>סיכום היום</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.small]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.eventSleepBg }]}>
              <Ionicons name="moon" size={20} color={theme.eventSleep} />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>{todayStats.sleeps}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>שינות</Text>
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

        {/* 5.5. 🔥 כרטיס קישור למסע גדילה חודשי (עיצוב נקי וקטן) 🔥 */}
        <Link href="/growth" asChild>
            <Pressable 
                style={({ pressed }) => [
                    styles.growthCard, 
                    { 
                        opacity: pressed ? 0.9 : 1, 
                        backgroundColor: theme.card, 
                    }, 
                    Shadows.small
                ]}
            >
                <View style={styles.growthCardInnerClean}>
                    <Text style={[styles.growthTitleClean, { color: theme.text }]}>
                        מסע גדילה חודשי 📸
                    </Text>
                    <Text style={[styles.growthSubtitleClean, { color: theme.textMuted }]}>
                        בנו קולאז' תמונות מעוצב (לחצו לצפייה).
                    </Text>
                </View>
            </Pressable>
        </Link>


        {/* 5. --- RECENT ACTIVITY (פעילות אחרונה) --- */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 10 }]}>ציר זמן</Text>
        <View style={styles.listContainer}>
          {sortedEvents.slice(0, 5).map((item, index) => {
            let dotColor = theme.textLight;
            let iconName: any = 'ellipse';
            let itemContentStyle: any = { backgroundColor: theme.card };
            
            // הגדרת צבעים לפי סוג האירוע
            if (item.type === 'feed') { dotColor = theme.eventFeed; iconName = 'restaurant'; itemContentStyle.backgroundColor = theme.eventFeedBg; }
            if (item.type === 'sleep') { dotColor = theme.eventSleep; iconName = 'moon'; itemContentStyle.backgroundColor = theme.eventSleepBg; }
            if (item.type === 'wake') { dotColor = theme.success; iconName = 'sunny'; itemContentStyle.backgroundColor = theme.success + '20'; } // צבע עדין
            if (item.type === 'diaper') { dotColor = theme.eventDiaper; iconName = 'water'; itemContentStyle.backgroundColor = theme.eventDiaperBg; }
            
            // הבלטה דרמטית של האירוע האחרון (index 0)
            const isLastEvent = index === 0;
            if (isLastEvent) {
                itemContentStyle = { ...itemContentStyle, paddingVertical: 18, borderRadius: 10 }; 
            } else {
                itemContentStyle.paddingVertical = 12; // ברירת מחדל לשאר הפריטים
                itemContentStyle.borderRadius = 0;
            }


            return (
              <Pressable 
                key={item.id} 
                onLongPress={() => handleDelete(item.id)}
                style={({pressed}) => [
                    styles.listItem, 
                    { opacity: pressed ? 0.7 : 1, height: isLastEvent ? 60 : 50, paddingHorizontal: isLastEvent ? 0 : 0 }
                ]}
              >
                <View style={[styles.listItemTime, { width: 55 }]}>
                  <Text style={[styles.timeText, { color: isLastEvent ? theme.textMain : theme.textMuted, fontWeight: isLastEvent ? '700' : '600' }]}>{item.time}</Text>
                </View>
                
                <View style={styles.listItemIndicator}>
                  <View style={[styles.indicatorLine, { backgroundColor: index === sortedEvents.length -1 ? 'transparent' : theme.border }]} />
                  <View style={[styles.indicatorDot, { backgroundColor: theme.card, borderColor: dotColor, transform: isLastEvent ? [{ scale: 1.3 }] : [{ scale: 1 }] }]}>
                    <Ionicons name={iconName} size={10} color={dotColor} />
                  </View>
                </View>

                {/* משתמשים ב-itemContentStyle המעוצב לשינוי רקע דרמטי */}
                <View style={[styles.listItemContent, itemContentStyle, { borderColor: theme.border, borderBottomWidth: index < sortedEvents.slice(0,4).length -1 ? 1 : 0 }]}>
                  <Text style={[styles.itemLabel, { color: theme.text, fontWeight: isLastEvent ? '700' : '500' }]}>{item.label}</Text>
                  
                  {/* הצגת משך השינה אם קיים */}
                  {item.durationMinutes !== undefined && item.type !== 'wake' && (
                     <Text style={[styles.timeText, { color: theme.textMuted, fontSize: 11 }]}>
                         משך: {formatDurationSimple(item.durationMinutes)}
                     </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* 6. --- WEEKLY TREND CHART PLACEHOLDER (מגמות) --- */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>מגמות שבועיות</Text>
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
  
  // 🔥 מצבי התחלה / Idle 🔥
  heroMainStart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    paddingVertical: 20,
  },
  timerTextStart: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  timerLabelStart: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },

  actionIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  actionIndicatorText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Stats Grid (סדר חדש: הסטטיסטיקות נמצאות אחרי הפעולות)
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

  // Smart Actions (סדר חדש: הפעולות נמצאות לפני הסטטיסטיקות)
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

  // 🔥 סגנונות חדשים לכרטיס מסע הגדילה (עיצוב נקי וקטן) 🔥
  growthCard: {
      flexDirection: 'row', // נשנה ל-row רגיל כי זה יותר נקי
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 12, // קטן יותר
      borderRadius: 16,
      marginBottom: 28,
      minHeight: 60, // קטן יותר
  },
  growthCardInnerClean: { 
      // ממקם את הטקסט במרכז
      alignItems: 'center', 
      justifyContent: 'center',
      paddingHorizontal: 5, 
  },
  growthTitleClean: {
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
  },
  growthSubtitleClean: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 2,
      color: Colors.light.textMuted,
  },
  // 🔥 סוף סגנונות חדשים 🔥

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
  listContainer: { gap: 0, borderRadius: 16, overflow: 'hidden' }, // הוספנו סטייל קונטיינר לעיגול פינות
  listItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 0, 
  },
  listItemTime: {
    width: 55,
    alignItems: 'flex-end',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  timeText: { fontSize: 12, fontWeight: '600' },
  listItemIndicator: {
    width: 30,
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 15,
  },
  indicatorLine: {
    width: 2,
    height: '100%',
    position: 'absolute',
  },
  indicatorDot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  listItemContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
    paddingVertical: 12, // ברירת מחדל
    borderBottomWidth: 1,
  },
  itemLabel: { fontSize: 15, fontWeight: '500', textAlign: 'left' },
});