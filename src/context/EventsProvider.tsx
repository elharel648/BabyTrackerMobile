import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export type TimelineEntryType = 'feed' | 'sleep' | 'diaper';

export type TimelineEntry = {
  id: string;
  type: TimelineEntryType;
  label: string;
  time: string; // HH:MM כמו שמוצג במסך
  timestamp: number; // Date.now()
};

type EventsContextValue = {
  events: TimelineEntry[];
  timeline: TimelineEntry[];
  addEntry: (entry: TimelineEntry) => void;
  clearAll: () => void;
};

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export const EventsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // תמיד מתחילים ממערך ריק – לא undefined
  const [events, setEvents] = useState<TimelineEntry[]>([]);

  const addEntry = useCallback((entry: TimelineEntry) => {
    setEvents(prev => [...prev, entry]);
  }, []);

  const clearAll = useCallback(() => {
    setEvents([]);
  }, []);

  // אם תרצה – אפשר לסנן פה רק אירועים של היום,
  // כרגע פשוט מחזירים את הכל.
  const timeline = useMemo(() => {
    return events;
  }, [events]);

  const value: EventsContextValue = useMemo(
    () => ({
      events,
      timeline,
      addEntry,
      clearAll,
    }),
    [events, timeline, addEntry, clearAll],
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    // במקום לזרוק שגיאה שתפיל את האפליקציה,
    // מחזירים אובייקט "ריק" כדי שלא יהיו קריסות.
    console.warn('useEvents used without EventsProvider – returning empty value');
    return {
      events: [] as TimelineEntry[],
      timeline: [] as TimelineEntry[],
      addEntry: (_entry: TimelineEntry) => {},
      clearAll: () => {},
    } satisfies EventsContextValue;
  }
  return ctx;
};
