import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

// --- הגדרות הטיפוסים ---
export type TimelineEntryType = 'feed' | 'sleep' | 'diaper' | 'wake';

export type TimelineEntry = {
  id: string;
  type: TimelineEntryType;
  label: string;
  time: string; // HH:MM
  timestamp: number; // Date.now()
};

type EventsContextValue = {
  events: TimelineEntry[];
  timeline: TimelineEntry[];
  addEntry: (entry: TimelineEntry) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
  isLoading: boolean; // כדי שנוכל לדעת אם הנתונים עדיין נטענים
};

const STORAGE_KEY = '@baby_tracker_events_v1';

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export const EventsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. טעינת נתונים בעלייה
  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonValue != null) {
          setEvents(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error('Failed to load events', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 2. שמירת נתונים בכל שינוי
  useEffect(() => {
    // מונע דריסה של הזיכרון עם מערך ריק בזמן הטעינה הראשונית
    if (!isLoading) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        } catch (e) {
          console.error('Failed to save events', e);
        }
      };
      saveData();
    }
  }, [events, isLoading]);

  const addEntry = useCallback((entry: TimelineEntry) => {
    setEvents(prev => [...prev, entry]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    setEvents([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear events', e);
    }
  }, []);

  const timeline = useMemo(() => {
    return events;
  }, [events]);

  const value: EventsContextValue = useMemo(
    () => ({
      events,
      timeline,
      addEntry,
      removeEntry,
      clearAll,
      isLoading,
    }),
    [events, timeline, addEntry, removeEntry, clearAll, isLoading],
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    return {
      events: [],
      timeline: [],
      addEntry: () => {},
      removeEntry: () => {},
      clearAll: () => {},
      isLoading: false,
    } as EventsContextValue;
  }
  return ctx;
};