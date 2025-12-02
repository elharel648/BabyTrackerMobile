import { useMemo } from 'react';
import { TimelineEntry } from '../EventsProvider';

const MS_IN_HOUR = 1000 * 60 * 60;

export type SleepPoint = { x: string; y: number };

export function useSleepStats(events: TimelineEntry[]) {
  return useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * MS_IN_HOUR);
    const last7d = new Date(now.getTime() - 7 * 24 * MS_IN_HOUR);

    const sleepEvents = events.filter(
      (e) => e.type === 'sleep' && e.start && e.end
    ) as Array<TimelineEntry & { start: string; end: string }>;

    let totalLast24 = 0;
    const daily: Record<string, number> = {};

    for (const ev of sleepEvents) {
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      const durationHours =
        (end.getTime() - start.getTime()) / MS_IN_HOUR;

      const dayKey = start.toISOString().slice(0, 10);

      if (end > last24h) {
        totalLast24 += durationHours;
      }
      if (end > last7d) {
        daily[dayKey] = (daily[dayKey] || 0) + durationHours;
      }
    }

    const dailyGraph: SleepPoint[] = Object.keys(daily)
      .sort()
      .map((dateStr) => {
        const d = new Date(dateStr);
        return {
          x: `${d.getDate()}/${d.getMonth() + 1}`,
          y: daily[dateStr],
        };
      });

    return { totalLast24, dailyGraph };
  }, [events]);
}
