import React, { useCallback, useMemo } from 'react';
import { I18nManager, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/card';
import { EmptyState } from '@/components/empty-state';
import { LoadingSpinner } from '@/components/loading-spinner';
import { QuickActionGrid, QuickActionItem } from '@/components/quick-action-grid';
import { StatRow } from '@/components/stat-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { useDiapers } from '@/hooks/useDiapers';
import { useFeeds } from '@/hooks/useFeeds';
import { useSleep } from '@/hooks/useSleep';

// TODO: Replace placeholder translation keys with actual keys in your i18n resources

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { colors, spacing, radii, typography, isRTL } = useTheme();

  const feedsState = useFeeds?.() ?? {};
  const sleepState = useSleep?.() ?? {};
  const diaperState = useDiapers?.() ?? {};

  const feeds = (feedsState as any)?.feeds ?? (feedsState as any)?.data ?? [];
  const sleepSessions = (sleepState as any)?.sleep ?? (sleepState as any)?.data ?? [];
  const diapers = (diaperState as any)?.diapers ?? (diaperState as any)?.data ?? [];

  const feedsLoading = Boolean((feedsState as any)?.loading ?? (feedsState as any)?.isLoading);
  const sleepLoading = Boolean((sleepState as any)?.loading ?? (sleepState as any)?.isLoading);
  const diapersLoading = Boolean((diaperState as any)?.loading ?? (diaperState as any)?.isLoading);

  const loading = feedsLoading || sleepLoading || diapersLoading;
  const hasData = Boolean(
    (Array.isArray(feeds) && feeds.length > 0) ||
      (Array.isArray(sleepSessions) && sleepSessions.length > 0) ||
      (Array.isArray(diapers) && diapers.length > 0)
  );

  const babyName = 'Alma';
  const babyAgeDays = 120;

  const today = useMemo(() => new Date(), []);

  const parseDate = (value: any): Date | undefined => {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const isSameDay = useCallback((dateA?: Date, dateB?: Date) => {
    if (!dateA || !dateB) return false;
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }, []);

  const getDurationMinutes = (item: any): number => {
    if (!item) return 0;
    if (typeof item.durationMinutes === 'number') return item.durationMinutes;
    if (typeof item.duration === 'number') return item.duration;
    if (typeof item.totalMinutes === 'number') return item.totalMinutes;
    const start = parseDate(item.start || item.startTime || item.timestamp);
    const end = parseDate(item.end || item.endTime || item.completedAt || item.finishedAt);
    if (start && end) {
      return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    }
    return 0;
  };

  const formatDuration = (minutes: number): string => {
    if (!minutes || minutes <= 0) return t('home.duration.zero', '0m');
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDisplayTime = (value: any): string | undefined => {
    const date = parseDate(value);
    if (!date) return undefined;
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const totalSleepMinutesToday = useMemo(() => {
    if (!Array.isArray(sleepSessions)) return 0;
    return sleepSessions
      .filter((session) => isSameDay(parseDate((session as any)?.start), today))
      .reduce((total, session) => total + getDurationMinutes(session), 0);
  }, [sleepSessions, isSameDay, today]);

  const feedCountToday = useMemo(() => {
    if (!Array.isArray(feeds)) return 0;
    return feeds.filter((feed) => isSameDay(parseDate((feed as any)?.time || (feed as any)?.start), today)).length;
  }, [feeds, isSameDay, today]);

  const diaperCountToday = useMemo(() => {
    if (!Array.isArray(diapers)) return 0;
    return diapers.filter((diaper) => isSameDay(parseDate((diaper as any)?.time || (diaper as any)?.timestamp), today)).length;
  }, [diapers, isSameDay, today]);

  const lastFeed = useMemo(() => (Array.isArray(feeds) ? feeds[0] : undefined), [feeds]);
  const lastSleep = useMemo(() => (Array.isArray(sleepSessions) ? sleepSessions[0] : undefined), [sleepSessions]);
  const lastDiaper = useMemo(() => (Array.isArray(diapers) ? diapers[0] : undefined), [diapers]);

  const handleLanguageToggle = useCallback(() => {
    const nextLang = i18n.language === 'he' ? 'en' : 'he';
    I18nManager.allowRTL(nextLang === 'he');
    I18nManager.forceRTL(nextLang === 'he');
    i18n.changeLanguage(nextLang);
  }, [i18n]);

  const handleQuickAction = useCallback(
    (path: string) => async () => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // no-op
      }
      router.push(path);
    },
    [router]
  );

  const quickActions: QuickActionItem[] = [
    {
      label: t('home.quickActions.logFeed', 'Log feed'),
      icon: 'restaurant',
      onPress: handleQuickAction('/feed/log'),
    },
    {
      label: t('home.quickActions.logSleep', 'Log sleep'),
      icon: 'moon',
      onPress: handleQuickAction('/sleep/log'),
    },
    {
      label: t('home.quickActions.logDiaper', 'Log diaper'),
      icon: 'water',
      onPress: handleQuickAction('/diaper/log'),
    },
    {
      label: t('home.quickActions.logMedicine', 'Log medicine'),
      icon: 'medkit',
      onPress: handleQuickAction('/medicine/log'),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors?.background }]}> 
        <ThemedView style={[styles.center, { padding: spacing?.xl ?? 24 }]}>
          <LoadingSpinner />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!hasData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors?.background }]}> 
        <ScrollView
          contentContainerStyle={{
            padding: spacing?.lg ?? 16,
            flexGrow: 1,
            justifyContent: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          <EmptyState
            title={t('home.empty.title', "No data yet")}
            description={t('home.empty.subtitle', 'Start by logging your first feed, sleep, or diaper change.')}
            actionLabel={t('home.empty.action', 'Log an entry')}
            onActionPress={handleQuickAction('/feed/log')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors?.background }]}> 
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            padding: spacing?.lg ?? 16,
            paddingBottom: (spacing?.xl ?? 24) * 2,
            gap: spacing?.lg ?? 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeaderSection
          babyName={babyName}
          babyAgeDays={babyAgeDays}
          onToggleLanguage={handleLanguageToggle}
          isRTL={isRTL || i18n.language === 'he'}
          colors={colors}
          spacing={spacing}
          radii={radii}
          typography={typography}
          language={i18n.language}
          t={t}
        />

        <TodaySummaryCard
          colors={colors}
          spacing={spacing}
          radii={radii}
          typography={typography}
          isRTL={isRTL || i18n.language === 'he'}
          totalSleepMinutes={totalSleepMinutesToday}
          feedCount={feedCountToday}
          diaperCount={diaperCountToday}
          t={t}
          formatDuration={formatDuration}
        />

        <LastEventsCard
          colors={colors}
          spacing={spacing}
          radii={radii}
          typography={typography}
          isRTL={isRTL || i18n.language === 'he'}
          lastFeed={lastFeed}
          lastSleep={lastSleep}
          lastDiaper={lastDiaper}
          getDurationLabel={formatDuration}
          getDurationMinutes={getDurationMinutes}
          getDisplayTime={getDisplayTime}
          t={t}
        />

        <QuickActionsSection
          colors={colors}
          spacing={spacing}
          radii={radii}
          typography={typography}
          isRTL={isRTL || i18n.language === 'he'}
          actions={quickActions}
          t={t}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

interface BaseSectionProps {
  colors: any;
  spacing: any;
  radii: any;
  typography: any;
  isRTL: boolean;
}

interface HeaderSectionProps extends BaseSectionProps {
  babyName: string;
  babyAgeDays: number;
  onToggleLanguage: () => void;
  language: string;
  t: (key: string, defaultValue?: string) => string;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  babyName,
  babyAgeDays,
  onToggleLanguage,
  language,
  colors,
  spacing,
  radii,
  typography,
  isRTL,
  t,
}) => {
  return (
    <ThemedView
      style={[
        styles.headerContainer,
        {
          padding: spacing?.lg ?? 16,
          borderRadius: radii?.lg ?? 16,
          backgroundColor: colors?.card,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: spacing?.md ?? 12,
        },
      ]}
    >
      <View style={{ flex: 1, gap: spacing?.xs ?? 6 }}>
        <ThemedText
          type="title"
          style={{
            textAlign: isRTL ? 'right' : 'left',
            ...(typography?.title ?? {}),
          }}
        >
          {t('home.header.greeting', `Good evening, ${babyName}'s family`)}
        </ThemedText>
        <ThemedText
          type="subtitle"
          style={{
            color: colors?.textSecondary,
            textAlign: isRTL ? 'right' : 'left',
            ...(typography?.subtitle ?? {}),
          }}
        >
          {t('home.header.age', `${babyName} · ${babyAgeDays} days old`)}
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.header.toggleLanguage', 'Toggle language')}
        onPress={onToggleLanguage}
        style={({ pressed }) => [
          styles.languagePill,
          {
            backgroundColor: colors?.surface,
            borderRadius: radii?.pill ?? (radii?.xl ?? 20),
            paddingHorizontal: spacing?.md ?? 12,
            paddingVertical: spacing?.xs ?? 6,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{
            color: colors?.primary,
            letterSpacing: 0.5,
            textAlign: 'center',
          }}
        >
          {language === 'he' ? 'HE' : 'EN'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
};

interface TodaySummaryCardProps extends BaseSectionProps {
  totalSleepMinutes: number;
  feedCount: number;
  diaperCount: number;
  t: (key: string, defaultValue?: string) => string;
  formatDuration: (minutes: number) => string;
}

const TodaySummaryCard: React.FC<TodaySummaryCardProps> = ({
  totalSleepMinutes,
  feedCount,
  diaperCount,
  colors,
  spacing,
  radii,
  typography,
  isRTL,
  t,
  formatDuration,
}) => {
  const summaryItems = [
    {
      label: t('home.summary.totalSleep', 'Total sleep today'),
      value: formatDuration(totalSleepMinutes),
      icon: 'moon',
    },
    {
      label: t('home.summary.feeds', 'Feeds today'),
      value: `${feedCount}`,
      icon: 'restaurant',
    },
    {
      label: t('home.summary.diapers', 'Diapers today'),
      value: `${diaperCount}`,
      icon: 'water',
    },
  ];

  return (
    <Card
      style={{
        padding: spacing?.lg ?? 16,
        borderRadius: radii?.lg ?? 16,
        gap: spacing?.md ?? 12,
      }}
    >
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
        <ThemedText type="subtitle" style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('home.summary.title', 'Today summary')}
        </ThemedText>
        <Ionicons name="today" size={20} color={colors?.primary} />
      </View>
      <View
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: spacing?.md ?? 12,
          justifyContent: 'space-between',
        }}
      >
        {summaryItems.map((item) => (
          <View key={item.label} style={{ flex: 1, gap: spacing?.xs ?? 6 }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: spacing?.xs ?? 6 }}>
              <Ionicons name={item.icon as any} size={18} color={colors?.primary} />
              <ThemedText type="caption" style={{ color: colors?.textSecondary, textAlign: isRTL ? 'right' : 'left' }}>
                {item.label}
              </ThemedText>
            </View>
            <ThemedText
              type="title"
              style={{
                fontSize: typography?.headline?.fontSize ?? 20,
                fontWeight: typography?.headline?.fontWeight ?? '700',
                textAlign: isRTL ? 'right' : 'left',
              }}
            >
              {item.value}
            </ThemedText>
          </View>
        ))}
      </View>
    </Card>
  );
};

interface LastEventsCardProps extends BaseSectionProps {
  lastFeed?: any;
  lastSleep?: any;
  lastDiaper?: any;
  getDurationLabel: (minutes: number) => string;
  getDurationMinutes: (item: any) => number;
  getDisplayTime: (value: any) => string | undefined;
  t: (key: string, defaultValue?: string) => string;
}

const LastEventsCard: React.FC<LastEventsCardProps> = ({
  lastFeed,
  lastSleep,
  lastDiaper,
  colors,
  spacing,
  radii,
  typography: _typography,
  isRTL,
  getDurationLabel,
  getDurationMinutes,
  getDisplayTime,
  t,
}) => {
  const lastFeedType = (lastFeed as any)?.type || (lastFeed as any)?.method;
  const lastDiaperType = (lastDiaper as any)?.type || (lastDiaper as any)?.status;

  return (
    <Card
      style={{
        padding: spacing?.lg ?? 16,
        borderRadius: radii?.lg ?? 16,
        gap: spacing?.md ?? 12,
      }}
    >
      <ThemedText type="subtitle" style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t('home.lastEvents.title', 'Last events')}
      </ThemedText>

      <StatRow
        label={t('home.lastEvents.feed', 'Last feed')}
        value={
          lastFeed
            ? `${getDisplayTime((lastFeed as any)?.time || (lastFeed as any)?.start) ?? ''} · ${
                lastFeedType || t('home.lastEvents.feedTypeUnknown', 'Unknown')
              }`
            : t('home.lastEvents.none', 'No data yet')
        }
        icon={<Ionicons name="restaurant" size={18} color={colors?.primary} />}
        alignment={isRTL ? 'right' : 'left'}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
      />

      <StatRow
        label={t('home.lastEvents.sleep', 'Last sleep')}
        value={
          lastSleep
            ? `${
                getDisplayTime((lastSleep as any)?.start) ?? t('home.lastEvents.timeUnknown', 'Time unknown')
              } · ${getDurationLabel(getDurationMinutes(lastSleep))}`
            : t('home.lastEvents.none', 'No data yet')
        }
        icon={<Ionicons name="moon" size={18} color={colors?.primary} />}
        alignment={isRTL ? 'right' : 'left'}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
      />

      <StatRow
        label={t('home.lastEvents.diaper', 'Last diaper')}
        value={
          lastDiaper
            ? `${
                getDisplayTime((lastDiaper as any)?.time || (lastDiaper as any)?.timestamp) ??
                t('home.lastEvents.timeUnknown', 'Time unknown')
              } · ${lastDiaperType || t('home.lastEvents.diaperTypeUnknown', 'Type unknown')}`
            : t('home.lastEvents.none', 'No data yet')
        }
        icon={<Ionicons name="water" size={18} color={colors?.primary} />}
        alignment={isRTL ? 'right' : 'left'}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
      />
    </Card>
  );
};

interface QuickActionsSectionProps extends BaseSectionProps {
  actions: QuickActionItem[];
  t: (key: string, defaultValue?: string) => string;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  actions,
  colors,
  spacing,
  radii,
  typography: _typography,
  isRTL,
  t,
}) => {
  return (
    <Card
      style={{
        padding: spacing?.lg ?? 16,
        borderRadius: radii?.lg ?? 16,
        gap: spacing?.md ?? 12,
      }}
    >
      <ThemedText type="subtitle" style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t('home.quickActions.title', 'Quick actions')}
      </ThemedText>
      <QuickActionGrid
        items={actions.map((action) => ({
          ...action,
          icon: action.icon ?? 'add',
        }))}
        spacing={spacing}
        radii={radii}
        colors={colors}
        isRTL={isRTL}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    width: '100%',
  },
  languagePill: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
