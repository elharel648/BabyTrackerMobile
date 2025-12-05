import { useMemo } from 'react';
import { TimelineEntry, useEvents } from '../EventsProvider';

export type DailyStats = {
  date: string;
  totalSleepMinutes: number;
  feedCount: number;
  diaperCount: number;
  sleepSessions: TimelineEntry[];
  wakeWindowsMinutes: number[];
};

export type BabyStats = {
  dailyStats: DailyStats[];
  todayStats: DailyStats;
  averageSleepMinutesPerDay: number;
  averageFeedsPerDay: number;
  averageDiapersPerDay: number; // 🔥 הוספנו את זה לטיפוס
  averageWakeWindowMinutes: number;
};

const formatDateKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
};

const MS_IN_MINUTE = 1000 * 60;

export const useBabyStats = (): BabyStats => {
  const { events } = useEvents();

  const aggregatedData = useMemo(() => {
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    const dailyMap = new Map<string, DailyStats>();
    const todayKey = formatDateKey(Date.now());
    let lastWakeTime = 0;

    const getDailyEntry = (dateKey: string): DailyStats => {
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          totalSleepMinutes: 0,
          feedCount: 0,
          diaperCount: 0,
          sleepSessions: [],
          wakeWindowsMinutes: [],
        });
      }
      return dailyMap.get(dateKey)!;
    };

    sortedEvents.forEach(event => {
      const dateKey = formatDateKey(event.timestamp);
      const dailyEntry = getDailyEntry(dateKey);

      switch (event.type) {
        case 'feed':
          dailyEntry.feedCount += 1;
          break;
        case 'diaper':
          dailyEntry.diaperCount += 1;
          break;
        case 'sleep':
          if (event.durationMinutes !== undefined && event.end !== undefined) {
            dailyEntry.totalSleepMinutes += event.durationMinutes;
            dailyEntry.sleepSessions.push(event);
          }
          if (lastWakeTime > 0) {
              const wakeWindowDuration = (event.timestamp - lastWakeTime) / MS_IN_MINUTE;
              dailyEntry.wakeWindowsMinutes.push(wakeWindowDuration);
          }
          break;
        case 'wake':
          lastWakeTime = event.timestamp;
          break;
      }
    });

    const lastSleep = sortedEvents.find(e => e.type === 'sleep' && e.end === undefined);
    if (lastSleep) {
      const timeSinceStart = (Date.now() - lastSleep.timestamp) / MS_IN_MINUTE;
      const sleepStartKey = formatDateKey(lastSleep.timestamp);
      if (sleepStartKey === todayKey) {
          getDailyEntry(todayKey).totalSleepMinutes += timeSinceStart;
      }
    }

    const dailyStatsArray = Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
    const todayStats = dailyStatsArray.find(d => d.date === todayKey) || getDailyEntry(todayKey);

    const numDays = dailyStatsArray.length || 1;
    const totalSleepMinutes = dailyStatsArray.reduce((sum, day) => sum + day.totalSleepMinutes, 0);
    const totalFeeds = dailyStatsArray.reduce((sum, day) => sum + day.feedCount, 0);
    const totalDiapers = dailyStatsArray.reduce((sum, day) => sum + day.diaperCount, 0);
    
    const allWakeWindows = dailyStatsArray.flatMap(d => d.wakeWindowsMinutes);
    const averageWakeWindowMinutes = allWakeWindows.length > 0 
        ? allWakeWindows.reduce((sum, duration) => sum + duration, 0) / allWakeWindows.length
        : 60;

    return {
      dailyStats: dailyStatsArray,
      todayStats,
      averageSleepMinutesPerDay: totalSleepMinutes / numDays,
      averageFeedsPerDay: totalFeeds / numDays,
      averageDiapersPerDay: totalDiapers / numDays, // 🔥 ודא ששורה זו קיימת
      averageWakeWindowMinutes,
    };
  }, [events]); 

  return aggregatedData;
};