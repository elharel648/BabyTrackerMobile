/**
 * constants/theme.ts
 * גרסה עשירה - "Rich Calm"
 */


const palette = {
  // רקעים - גוונים חמים ועשירים יותר
  cream: '#F2F6F7',        // רקע כללי - אפור-כחלחל בהיר מאוד, מודרני
  white: '#FFFFFF',
  
  // צבעי מותג
  sage: '#6B9080',         // ירוק מרווה עמוק
  sageLight: '#A4C3B2',    // ירוק בהיר
  mint: '#EAF4F4',         // רקע מנטה עדין
  
  primary: '#5B7C99',      // כחול פלדה - רציני ומרגיע
  secondary: '#F6FFF8',    // לבן-ירקרק
  
  // צבעי אירועים (בולטים אך נעימים)
  feed: '#E6A57E',         // טרה-קוטה בהירה
  feedBg: '#FFF5EB',       // רקע כתמתם
  feedAccent: '#FFD8BE',   
  
  sleep: '#8E9AAF',        // לבנדר-אפור
  sleepBg: '#F4F6FA',      // רקע כחלחל
  sleepAccent: '#D0D9ED',

  diaper: '#8AC6D1',       // תכלת מים
  diaperBg: '#F0F8FA',     // רקע תכלת
  diaperAccent: '#BCE3EB',
  
  // טקסטים
  textMain: '#2D3436',     // כמעט שחור
  textMuted: '#636E72',    // אפור כהה
  textLight: '#B2BEC3',    // אפור בהיר
  
  // סטטוסים
  success: '#00B894',
  warning: '#FD9644',
  error: '#FF7675',
};

export const Colors = {
  light: {
    text: palette.textMain,
    textMuted: palette.textMuted,
    textLight: palette.textLight,
    background: palette.cream,
    card: palette.white,
    tint: palette.primary,
    icon: palette.textMuted,
    tabIconDefault: '#DAE0E2',
    tabIconSelected: palette.sage,
    border: '#DFE6E9',
    
    // ספציפי לאירועים
    eventFeed: palette.feed,
    eventFeedBg: palette.feedBg,
    eventFeedAccent: palette.feedAccent,
    
    eventSleep: palette.sleep,
    eventSleepBg: palette.sleepBg,
    eventSleepAccent: palette.sleepAccent,
    
    eventDiaper: palette.diaper,
    eventDiaperBg: palette.diaperBg,
    eventDiaperAccent: palette.diaperAccent,
    
    // כללי
    heroGradientStart: '#6B9080',
    heroGradientEnd: '#5B7C99',
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  },
  dark: {
    // ניתן להוסיף התאמה לכהה בהמשך, כרגע נשמור על בהירות
    text: palette.textMain,
    textMuted: palette.textMuted,
    textLight: palette.textLight,
    background: palette.cream,
    card: palette.white,
    tint: palette.primary,
    icon: palette.textMuted,
    tabIconDefault: '#DAE0E2',
    tabIconSelected: palette.sage,
    border: '#DFE6E9',
    eventFeed: palette.feed,
    eventFeedBg: palette.feedBg,
    eventFeedAccent: palette.feedAccent,
    eventSleep: palette.sleep,
    eventSleepBg: palette.sleepBg,
    eventSleepAccent: palette.sleepAccent,
    eventDiaper: palette.diaper,
    eventDiaperBg: palette.diaperBg,
    eventDiaperAccent: palette.diaperAccent,
    heroGradientStart: '#6B9080',
    heroGradientEnd: '#5B7C99',
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  },
};

export const Shadows = {
  small: {
    shadowColor: '#2D3436',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#2D3436',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    shadowColor: '#636E72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  }
};