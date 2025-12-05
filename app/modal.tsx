import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEvents } from '@/src/context/EventsProvider';

// הפעלת אנימציות באנדרואיד
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


// --- רכיב עזר: כפתור בחירה עגול עם אנימציה מובנית (יציבה) ---
const RoundButton: React.FC<{
    iconName: keyof typeof Ionicons.glyphMap | string;
    label: string;
    isSelected: boolean;
    onPress: () => void;
    baseColor: string;
    theme: any;
}> = ({ iconName, label, isSelected, onPress, baseColor, theme }) => {
    
    return (
        <Pressable 
            // 🔥 אפקט Scale מובנה 🔥
            style={({ pressed }) => [
                styles.roundButtonWrapper,
                { transform: [{ scale: pressed ? 0.95 : 1 }] } 
            ]}
            onPress={onPress}
        >
            <View 
                style={[
                    styles.roundButton, 
                    { 
                        backgroundColor: theme.card, 
                        borderColor: isSelected ? baseColor : theme.border,
                        borderWidth: isSelected ? 2 : 1, 
                        opacity: isSelected ? 1 : 0.7, 
                    },
                ]} 
            >
                {/* אייקון / אימוג'י */}
                <View style={[styles.roundButtonIcon, { backgroundColor: isSelected ? baseColor + '15' : theme.background }]}>
                    {typeof iconName === 'string' && iconName.length > 3 ? (
                        <Text style={{ fontSize: 30 }}>{iconName}</Text> // אימוג'י
                    ) : (
                        <Ionicons 
                            name={iconName as keyof typeof Ionicons.glyphMap} 
                            size={28} 
                            color={isSelected ? baseColor : theme.textMuted}
                        />
                    )}
                </View>
                
                <Text style={[styles.roundButtonLabel, { color: isSelected ? baseColor : theme.textMuted }]}>
                    {label}
                </Text>
            </View>
        </Pressable>
    );
};

// --- רכיב לדיווח אוכל ---
const FeedForm = ({ onSubmit, theme, eventColor }: any) => {
    const [type, setType] = useState<'breast' | 'bottle' | null>(null);
    const [side, setSide] = useState<'left' | 'right' | null>(null);
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    
    const handleReport = () => {
        if (!type) {
             Alert.alert("חסר מידע", "אנא בחר סוג דיווח (הנקה או בקבוק).");
             return;
        }

        let label = '';
        if (type === 'bottle') {
            if (!amount) {
                Alert.alert("חסר מידע", "אנא הזן כמות בקבוק.");
                return;
            }
            label = `בקבוק ${amount} מ"ל`;
        } else if (type === 'breast') {
            if (!side) {
                Alert.alert("חסר מידע", "אנא בחר צד הנקה.");
                return;
            }
            label = `הנקה מצד ${side === 'left' ? 'שמאל' : 'ימין'}`;
        }
        
        if (notes.trim().length > 0) {
            label = `${label} (${notes.trim()})`;
        }
        
        onSubmit('feed', label);
    }
    
    return (
        <ScrollView contentContainerStyle={styles.scrollForm} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: theme.text }]}>סוג האכלה:</Text>
                <View style={styles.optionRow}>
                    <RoundButton 
                        iconName="body" 
                        label="הנקה" 
                        isSelected={type === 'breast'} 
                        onPress={() => setType('breast')} 
                        baseColor={eventColor}
                        theme={theme}
                    />
                    <RoundButton 
                        iconName="flask" 
                        label="בקבוק" 
                        isSelected={type === 'bottle'} 
                        onPress={() => setType('bottle')} 
                        baseColor={eventColor}
                        theme={theme}
                    />
                </View>

                {type === 'breast' && (
                    <View style={styles.inputGroup}>
                        <Text style={[styles.formLabel, { color: theme.textMuted }]}>צד אחרון להנקה:</Text>
                        <View style={styles.sideButtons}>
                             <TouchableOpacity 
                                onPress={() => setSide('right')}
                                style={[styles.sideButton, {borderColor: theme.border}, side === 'right' && { backgroundColor: eventColor, borderColor: eventColor }]}
                            >
                                <Text style={[styles.sideButtonText, { color: side === 'right' ? '#FFF' : theme.text }]}>ימין</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setSide('left')}
                                style={[styles.sideButton, {borderColor: theme.border}, side === 'left' && { backgroundColor: eventColor, borderColor: eventColor }]}
                            >
                                <Text style={[styles.sideButtonText, { color: side === 'left' ? '#FFF' : theme.text }]}>שמאל</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {type === 'bottle' && (
                    <View style={styles.inputGroup}>
                         <Text style={[styles.formLabel, { color: theme.textMuted }]}>כמות (מ"ל):</Text>
                        <TextInput 
                            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                            keyboardType="numeric"
                            placeholder="הזן כמות"
                            placeholderTextColor={theme.textMuted}
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                )}

                <View style={styles.notesContainer}>
                    <Text style={[styles.formLabel, { color: theme.textMuted }]}>הערות (אופציונלי):</Text>
                    <TextInput 
                        style={[styles.notesInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                        placeholder="הערות על האכלה / מותג פורמולה"
                        placeholderTextColor={theme.textMuted}
                        multiline={true}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                <TouchableOpacity style={[styles.reportButton, { backgroundColor: eventColor }]} onPress={handleReport}>
                    <Text style={styles.reportButtonText}>דווח ארוחה כעת</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

// רכיב לדיווח חיתול
const DiaperForm = ({ onSubmit, theme, eventColor, feedColor }: any) => {
    const [diaperType, setDiaperType] = useState<'wet' | 'poop' | 'mixed' | null>(null);
    const [notes, setNotes] = useState('');
    
    const handleReport = () => {
        let label = '';
        if (!diaperType) {
            Alert.alert("חסר מידע", "אנא בחר את סוג החיתול.");
            return;
        }

        switch (diaperType) {
            case 'wet': label = 'חיתול רטוב'; break;
            case 'poop': label = 'חיתול קקי'; break;
            case 'mixed': label = 'חיתול מעורב'; break;
        }
        
        if (notes.trim().length > 0) {
            label = `${label} (${notes.trim()})`;
        }

        onSubmit('diaper', label);
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollForm} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
                <Text style={[styles.formHeader, { color: theme.text }]}>סוג החיתול שדווח:</Text>
                
                <View style={styles.optionRow}>
                    <RoundButton 
                        iconName="water" 
                        label="רטוב" 
                        isSelected={diaperType === 'wet'} 
                        onPress={() => setDiaperType('wet')} 
                        baseColor={eventColor}
                        theme={theme}
                    />
                    <RoundButton 
                        iconName="💩" // אימוג'י לקקי
                        label="קקי" 
                        isSelected={diaperType === 'poop'} 
                        onPress={() => setDiaperType('poop')} 
                        baseColor={feedColor} // משתמש בצבע האוכל לקקי (קונסיסטנטיות)
                        theme={theme}
                    />
                    <RoundButton 
                        iconName="swap-horizontal" 
                        label="מעורב" 
                        isSelected={diaperType === 'mixed'} 
                        onPress={() => setDiaperType('mixed')} 
                        baseColor={theme.tint}
                        theme={theme}
                    />
                </View>

                <View style={styles.notesContainer}>
                    <Text style={[styles.formLabel, { color: theme.textMuted }]}>הערות (אופציונלי):</Text>
                    <TextInput 
                        style={[styles.notesInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
                        placeholder="פריחה, דליפה, שינוי צבע..."
                        placeholderTextColor={theme.textMuted}
                        multiline={true}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>


                <TouchableOpacity style={[styles.reportButton, { backgroundColor: eventColor }]} onPress={handleReport}>
                    <Text style={styles.reportButtonText}>דווח חיתול כעת</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

// --- רכיב ראשי ---

export default function EventModalScreen() {
  const router = useRouter();
  const { eventType } = useLocalSearchParams<{ eventType: 'feed' | 'diaper' }>();
  const { addEntry } = useEvents();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const modalTitle = eventType === 'feed' ? 'דיווח ארוחה' : 'דיווח חיתול';
  const eventColor = eventType === 'feed' ? theme.eventFeed : theme.eventDiaper;
  const feedColor = theme.eventFeed; 

  const handleFormSubmit = (type: 'feed' | 'diaper', label: string) => {
      addEntry({
          id: Date.now().toString(),
          type,
          label,
          time: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
      });
      router.back(); 
  }

  return (
    <ThemedView style={styles.container}>
        <Stack.Screen options={{ 
            title: modalTitle,
            headerShown: false,
            presentation: 'modal', 
        }} />
        
        {/* כפתור סגירה מותאם אישית (בפינה הימנית למעלה) */}
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close-circle" size={36} color={theme.textMuted} />
        </TouchableOpacity>


        <Text style={[styles.modalTitle, { color: theme.text }]}>{modalTitle}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            בחר את הפרטים המדויקים ודווח
        </Text>
        
        <View style={styles.content}>
            {eventType === 'feed' && <FeedForm onSubmit={handleFormSubmit} theme={theme} eventColor={eventColor} />}
            {eventType === 'diaper' && <DiaperForm onSubmit={handleFormSubmit} theme={theme} eventColor={eventColor} feedColor={feedColor} />}
        </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    // מגדיר גובה מקסימלי כדי לגרום ל-Sheet View
    maxHeight: Platform.OS === 'web' ? '80%' : undefined, 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    alignSelf: 'center',
  },
  scrollForm: { // קונטיינר ל-ScrollView של הטופס
    paddingBottom: 40, 
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 600,
    paddingHorizontal: 20,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    right: 15,
    zIndex: 10,
  },
  // --- Form Styles ---
  formContainer: {
      width: '100%',
      gap: 25,
      alignItems: 'center',
  },
  formHeader: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
    width: '100%',
    marginBottom: 5,
  },
  formLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 5,
      textAlign: 'right',
      width: '100%',
  },
  optionRow: {
      flexDirection: 'row-reverse',
      gap: 15,
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 10,
  },
  // כפתור בחירת סוג (עגול) - כעת משתמש ב-Pressable רגיל
  roundButtonWrapper: {
    flex: 1,
    borderRadius: 15, // שומר על העיגול
  },
  roundButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    minHeight: 120,
  },
  roundButtonIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
  },
  roundButtonSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  roundButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  inputGroup: {
      marginTop: 15,
      marginBottom: 10,
      width: '100%',
  },
  input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      fontSize: 16,
      textAlign: 'right',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
  },
  notesContainer: {
      width: '100%',
      marginTop: 15,
  },
  notesInput: { 
      minHeight: 100,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingTop: 15,
      fontSize: 16,
      textAlignVertical: 'top',
  },
  // כפתורי צד (ימין/שמאל)
  sideButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 10,
  },
  sideButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.light.border,
      marginHorizontal: 5,
  },
  sideButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // כפתור דיווח
  reportButton: {
      paddingVertical: 18,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 20,
      width: '100%',
  },
  reportButtonText: {
      color: '#FFF',
      fontSize: 18,
      fontWeight: '700',
  },
});