// src/context/EventsProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type TimelineEntryType = 'feed' | 'sleep' | 'diaper';

export type TimelineEntry = {
  id: string;
  type: TimelineEntryType;
  label: string;
  time: string;      // תצוגה – שעה בפורמט אנושי
  timestamp: number; // מילישניות מאז epoch – לשימוש פנימי
};

type EventsContextValue = {
  timeline: TimelineEntry[];
  addEntry: (entry: TimelineEntry) => void;
  clearToday: () => void;
};

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

const STORAGE_KEY = 'babyTracker:timeline';

type Props = {
  children: ReactNode;
};

export const EventsProvider: React.FC<Props> = ({ children }) => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  // טעינה מ-AsyncStorage
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const parsed: TimelineEntry[] = JSON.parse(raw);

        // פה אפשר בעתיד לסנן לפי תאריך (היום) אם תרצה
        setTimeline(parsed);
      } catch (e) {
        console.warn('Failed to load timeline', e);
      }
    };

    load();
  }, []);

  // שמירה ב-AsyncStorage כשמשתנה
  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(timeline));
      } catch (e) {
        console.warn('Failed to save timeline', e);
      }
    };

    save();
  }, [timeline]);

  const addEntry = (entry: TimelineEntry) => {
    setTimeline(prev => [entry, ...prev].slice(0, 200));
  };

  const clearToday = () => {
    // כרגע מוחקים הכל – בהמשך אפשר למחוק רק את היום
    setTimeline([]);
  };

  const value: EventsContextValue = {
    timeline,
    addEntry,
    clearToday,
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEvents = (): EventsContextValue => {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    throw new Error('useEvents must be used within EventsProvider');
  }
  return ctx;
};
