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
  time: string; // HH:MM (לצורך הצגה)
  timestamp: number; // Date.now() (זמן יצירה)
  
  // 🔥 הוספת שדות לניהול משך שינה 🔥
  start?: number; // timestamp: זמן התחלה (עבור אירועי שינה)
  end?: number;   // timestamp: זמן סיום (עבור אירועי שינה)
  durationMinutes?: number; // משך (עבור אירועי שינה שהסתיימו)
};

type EventsContextValue = {
  events: TimelineEntry[];
  timeline: TimelineEntry[];
  addEntry: (entry: TimelineEntry) => void;
  removeEntry: (id: string) => void;
  clearAll: () => void;
  isLoading: boolean; // כדי שנוכל לדעת אם הנתונים עדיין נטענים
  isSleeping: boolean; // 🔥 סטטוס שינה נוכחי 🔥
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
          // לוודא שה-timestamps נשארים מספרים
          const loadedEvents: TimelineEntry[] = JSON.parse(jsonValue);
          setEvents(loadedEvents);
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
  
  // 🔥🔥🔥 לוגיקת הוספת אירוע חכמה 🔥🔥🔥
  const addEntry = useCallback((entry: TimelineEntry) => {
    setEvents(prevEvents => {
      // אם האירוע הוא "התעוררות" (wake)
      if (entry.type === 'wake') {
        const lastSleepIndex = prevEvents.findIndex(
          e => e.type === 'sleep' && !e.end 
        );

        // אם נמצא אירוע שינה פתוח
        if (lastSleepIndex !== -1) {
          const sleepEvent = prevEvents[lastSleepIndex];
          const endTime = entry.timestamp;
          const startTime = sleepEvent.start || sleepEvent.timestamp;
          
          const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
          
          // יצירת עותק מעודכן של רשימת האירועים
          const newEvents = [...prevEvents];
          
          // עדכון אירוע השינה הקיים
          newEvents[lastSleepIndex] = {
            ...sleepEvent,
            end: endTime,
            durationMinutes: durationMinutes,
          };
          
          // הוספת אירוע ה-wake לרשימה
          return [...newEvents, entry];
        }
      }
      
      // אם האירוע הוא "שינה" (sleep), שומרים את ה-timestamp כ-start
      if (entry.type === 'sleep') {
          return [...prevEvents, { ...entry, start: entry.timestamp }];
      }

      // עבור כל אירוע אחר (feed, diaper, wake ללא sleep פתוח)
      return [...prevEvents, entry];
    });
  }, []);
  // 🔥🔥🔥 סוף לוגיקת הוספת אירוע חכמה 🔥🔥🔥


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

  const sortedEvents = useMemo(() => {
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [events]);
  
  const timeline = sortedEvents;

  // 🔥 חישוב סטטוס שינה 🔥
  const isSleeping = useMemo(() => {
    const lastSleep = sortedEvents.find(e => e.type === 'sleep' || e.type === 'wake');
    return lastSleep?.type === 'sleep' && !lastSleep.end;
  }, [sortedEvents]);

  const value: EventsContextValue = useMemo(
    () => ({
      events: sortedEvents, // מעביר את האירועים ממוינים
      timeline,
      addEntry,
      removeEntry,
      clearAll,
      isLoading,
      isSleeping, // 🔥
    }),
    [sortedEvents, timeline, addEntry, removeEntry, clearAll, isLoading, isSleeping],
  );

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) {
    // 🔥 עדכון ערכי ברירת המחדל 🔥
    return {
      events: [],
      timeline: [],
      addEntry: () => {},
      removeEntry: () => {},
      clearAll: () => {},
      isLoading: false,
      isSleeping: false,
    } as EventsContextValue;
  }
  return ctx;
};

// 🔥 ודא שמחקת את EventsProvider.tsx הלא נחוץ בתיקייה הראשית (אם קיים) 🔥