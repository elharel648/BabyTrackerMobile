import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors, Shadows } from '../../constants/theme';

// 🔥🔥 נשתמש ב-Mock State עבור Authentication עד שנתקין Backend 🔥🔥
type AuthState = 'LOGGED_OUT' | 'LOGGED_IN';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  // 🔥 מצב מדומה של חיבור: נניח שהמשתמש מחובר כברירת מחדל 🔥
  const [authState, setAuthState] = useState<AuthState>('LOGGED_IN');
  
  // מצבים זמניים (בהמשך נחבר ל-Backend)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- פונקציות Mock ---
  const handleAuth = (type: 'login' | 'google' | 'facebook' | 'logout') => {
      if (type === 'logout') {
          Alert.alert('התנתקות', 'בטוח שרוצה להתנתק?', [
              { text: 'ביטול', style: 'cancel' },
              { text: 'התנתק', style: 'destructive', onPress: () => setAuthState('LOGGED_OUT') }
          ]);
      } else if (type === 'login') {
          Alert.alert('התחברות (Mock)', 'התחברת בהצלחה!', [{ text: 'אישור', onPress: () => setAuthState('LOGGED_IN') }]);
      } else {
          Alert.alert('חיבור באמצעות ' + type, 'פיצ\'ר זה דורש תצורת Backend', [{ text: 'אישור' }]);
      }
  };


  // רכיב עזר: שורת הגדרה
  const SettingRow = ({ icon, title, subtitle, isDestructive = false, onPress, value, onToggle, iconColor, iconBg, hasSwitch = false }: any) => (
    <TouchableOpacity 
      style={[styles.row, { backgroundColor: theme.card }]} 
      onPress={onToggle ? () => onToggle(!value) : onPress}
      activeOpacity={onToggle ? 1 : 0.7}
      disabled={hasSwitch && onToggle === undefined} // אם יש סוויץ' והוא לא עביר, ננטרל לחיצה על השורה כולה.
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg || theme.background }]}>
          <Ionicons name={icon} size={20} color={iconColor || (isDestructive ? theme.error : theme.tint)} />
        </View>
        <View>
          <Text style={[styles.rowTitle, { color: isDestructive ? theme.error : theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.rowSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
        </View>
      </View>
      
      {hasSwitch ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: theme.tint }}
          thumbColor={'#f4f3f4'}
        />
      ) : (
        <Ionicons name={isDestructive ? "trash-outline" : "chevron-back"} size={20} color={isDestructive ? theme.error : theme.textLight} /> 
      )}
    </TouchableOpacity>
  );

  // רכיב עזר: כותרת סקציה
  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>{title}</Text>
  );

  // --- תוכן דינמי: כרטיס פרופיל או כרטיס חיבור ---
  const ProfileSection = () => {
    if (authState === 'LOGGED_OUT') {
      return (
        <View style={[styles.profileCard, { backgroundColor: theme.card }, Shadows.medium]}>
          <Text style={[styles.loginHeader, { color: theme.text }]}>התחברות והרשמה</Text>
          <Text style={[styles.loginSubheader, { color: theme.textMuted }]}>
            התחבר כדי לשמור ולסנכרן את נתוני המעקב שלך.
          </Text>

          <TouchableOpacity 
            style={[styles.authButton, { backgroundColor: theme.tint }]} 
            onPress={() => handleAuth('login')}
          >
             <Text style={styles.authButtonText}>התחבר עם אימייל וסיסמה</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButtonSocial, { backgroundColor: '#DB4437', marginTop: 10 }]} 
            onPress={() => handleAuth('google')}
          >
             <Ionicons name="logo-google" size={20} color="#FFF" style={styles.socialIcon} />
             <Text style={styles.authButtonText}>התחבר באמצעות Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.authButtonSocial, { backgroundColor: '#4267B2', marginTop: 10 }]} 
            onPress={() => handleAuth('facebook')}
          >
             <Ionicons name="logo-facebook" size={20} color="#FFF" style={styles.socialIcon} />
             <Text style={styles.authButtonText}>התחבר באמצעות Facebook</Text>
          </TouchableOpacity>
          
        </View>
      );
    }
    
    // מצב מחובר (LOGGED_IN)
    return (
      <View style={[styles.profileCard, { backgroundColor: theme.card }, Shadows.medium]}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>א</Text>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={12} color="#FFF" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>אבא של עלמה</Text>
            <Text style={[styles.profileEmail, { color: theme.textMuted }]}>aba@example.com</Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.tint + '20' }]}>
              <Text style={[styles.roleText, { color: theme.tint }]}>מנהל משפחה 👑</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  // ----------------------------------------------------
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER & PROFILE CARD --- */}
        <Text style={[styles.pageTitle, { color: theme.text }]}>הגדרות ופרופיל</Text>

        {ProfileSection()}

        {/* --- SETTINGS SECTIONS (מוצג רק אם מחובר או כבסיס) --- */}

        {/* קבוצה 1: הבייבי */}
        <View style={styles.sectionContainer}>
          <SectionHeader title="הבייבי שלי" />
          <View style={[styles.sectionContent, { backgroundColor: theme.card }, Shadows.small]}>
            <SettingRow 
              icon="accessibility-outline" 
              title="פרטים אישיים" 
              subtitle="שם, תאריך לידה, משקל"
              iconColor="#FF9F1C" 
              iconBg="#FFF3E0"
              onPress={() => {Alert.alert('בקרוב', 'מסך פרטי בייבי')}}
            />
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <SettingRow 
              icon="people-outline" 
              title="צוות מטפלים" 
              subtitle="ניהול הרשאות ושיתוף"
              iconColor="#2EC4B6" 
              iconBg="#E0F2F1"
              onPress={() => Alert.alert('בקרוב', 'פיצ\'ר שיתוף מטפלים יהיה זמין בקרוב')}
            />
          </View>
        </View>

        {/* קבוצה 2: העדפות */}
        <View style={styles.sectionContainer}>
          <SectionHeader title="העדפות מערכת" />
          <View style={[styles.sectionContent, { backgroundColor: theme.card }, Shadows.small]}>
            <SettingRow 
              icon="notifications-outline" 
              title="התראות חכמות" 
              value={notificationsEnabled}
              onToggle={setNotificationsEnabled}
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              hasSwitch
            />
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <SettingRow 
              icon="volume-high-outline" 
              title="צלילים" 
              value={soundEnabled}
              onToggle={setSoundEnabled}
              iconColor="#F472B6"
              iconBg="#FCE7F3"
              hasSwitch
            />
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
            <SettingRow 
              icon="color-palette-outline" 
              title="מצב לילה (Dark Mode)" 
              value={darkModeEnabled}
              onToggle={setDarkModeEnabled}
              iconColor="#64748B"
              iconBg="#F1F5F9"
              hasSwitch
            />
          </View>
        </View>

        {/* קבוצה 3: אזור אישי ו-Auth (מוצג רק אם מחובר) */}
        {authState === 'LOGGED_IN' && (
          <View style={styles.sectionContainer}>
            <SectionHeader title="אזור אישי" />
            <View style={[styles.sectionContent, { backgroundColor: theme.card }, Shadows.small]}>
              <SettingRow 
                icon="cloud-upload-outline" 
                title="ייצוא וגיבוי נתונים" 
                onPress={() => Alert.alert('בקרוב', 'ייצוא נתונים ל-CSV/JSON')}
                iconColor={theme.textMuted}
                iconBg={theme.background}
              />
              <View style={[styles.separator, { backgroundColor: theme.border }]} />
              <SettingRow 
                icon="log-out-outline" 
                title="התנתקות" 
                isDestructive
                onPress={() => handleAuth('logout')}
                iconBg="#FEF2F2"
              />
            </View>
          </View>
        )}
        
        {/* קבוצה 4: יציאה וכניסה (אם מנותק) */}
        {authState === 'LOGGED_OUT' && (
             <View style={styles.sectionContainer}>
                <SectionHeader title="אפשרויות נוספות" />
                <View style={[styles.sectionContent, { backgroundColor: theme.card }, Shadows.small]}>
                     <SettingRow 
                        icon="lock-closed-outline" 
                        title="שכחתי סיסמה" 
                        onPress={() => Alert.alert('שכחתי סיסמה', 'בקרוב קישור לעמוד איפוס')}
                        iconColor={theme.error}
                        iconBg="#FEF2F2"
                    />
                </View>
            </View>
        )}

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.textLight }]}>ParentApp v1.0.0 (Beta)</Text>
          <Text style={[styles.versionText, { color: theme.textLight }]}>Made with ❤️ for Alma</Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'left',
  },

  // Profile/Auth Card
  profileCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  loginHeader: { fontSize: 22, fontWeight: '700', marginBottom: 5, textAlign: 'left' },
  loginSubheader: { fontSize: 14, marginBottom: 20, textAlign: 'left' },
  
  authButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  authButtonSocial: {
    flexDirection: 'row-reverse',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
      position: 'absolute',
      right: 15,
  },
  authButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  
  // Profile View
  profileHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    position: 'relative',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#6366F1' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: { alignItems: 'flex-end' },
  profileName: { fontSize: 20, fontWeight: '700' },
  profileEmail: { fontSize: 14, marginTop: 2, marginBottom: 6 },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: { fontSize: 11, fontWeight: '600' },

  // Sections
  sectionContainer: { marginBottom: 24 },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'left',
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Rows
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 16, fontWeight: '500' },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  
  separator: {
    height: 1,
    marginLeft: 16, // Indent separator
    opacity: 0.5,
  },

  // Footer
  footer: { alignItems: 'center', marginTop: 10, gap: 4 },
  versionText: { fontSize: 12 },
});