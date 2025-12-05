import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg'; // 🔥 ייבוא SVG

const MAX_MONTHS = 12;
const CARD_WIDTH = (Dimensions.get('window').width - 60) / 2; // רוחב קבוע לשני כרטיסים בטור

// --- רכיב עזר: אוברליי SVG דינמי ---
const DigitalOverlay = ({ month, color }: { month: number, color: string }) => (
    <Svg height="100%" width="100%" viewBox="0 0 200 200">
        {/* רקע עדין לאוברליי (כמו וינייט) */}
        <Rect x="0" y="0" width="200" height="200" fill="rgba(0,0,0,0.2)" />
        
        {/* טקסט הספרה הגדולה (1-12) */}
        <SvgText
            x="180" 
            y="180"
            fontSize="100"
            fontWeight="900"
            fill={color}
            textAnchor="end" // מיקום מימין למטה
            opacity="0.8"
            fontFamily={Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif'}
        >
            {month}
        </SvgText>
        
        {/* טקסט 'חודש' קטן */}
        <SvgText
            x="180" 
            y="190"
            fontSize="20"
            fontWeight="600"
            fill={color}
            textAnchor="end"
            opacity="0.6"
            fontFamily={Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif'}
        >
            חודש
        </SvgText>
    </Svg>
);


export default function GrowthScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    
    // 🔥 Mock: נתונים לשמירת תמונות לפי חודש 🔥
    const [growthData, setGrowthData] = useState<Record<number, string | null>>({}); 

    // פונקציית בחירת תמונה (תמומש בהמשך)
    const handleImagePick = (month: number) => {
        // Logica for picking image and setting the growthData[month] = uri
        Alert.alert(`בחירת תמונה לחודש ${month}`, `כאן יפתח Picker תמונה לעיבוד ויתווסף אוברליי עם הספרה ${month}`);
    };

    const MonthCard = ({ month }: { month: number }) => {
        const imageUri = growthData[month];
        const isCompleted = !!imageUri;
        const cardColor = isCompleted ? theme.success : theme.tint;

        return (
            <View style={[styles.monthCard, { borderColor: theme.border, backgroundColor: theme.card }]}>
                
                {/* חלון התמונה והאוברליי */}
                <Pressable
                    onPress={() => handleImagePick(month)}
                    style={styles.imagePlaceholder}
                >
                    <View style={styles.imageContainer}>
                        {imageUri ? (
                            <>
                                {/* <Image source={{ uri: imageUri }} style={styles.monthImage} /> */}
                                <Text style={styles.completedIcon}>🎉</Text>
                                <DigitalOverlay month={month} color={theme.card} />
                            </>
                        ) : (
                            // מצב ריק
                            <View style={styles.emptyContent}>
                                <Ionicons name="camera" size={40} color={cardColor} />
                                <Text style={[styles.emptyText, { color: cardColor }]}>חודש {month}</Text>
                            </View>
                        )}
                    </View>
                </Pressable>

                {/* כפתור פעולה קטן */}
                <Pressable
                    onPress={() => handleImagePick(month)}
                    style={({ pressed }) => [
                        styles.actionButton,
                        { backgroundColor: cardColor, opacity: pressed ? 0.8 : 1 }
                    ]}
                >
                    <Ionicons name={isCompleted ? "create-outline" : "camera-outline"} size={18} color="#FFF" />
                    <Text style={styles.actionButtonText}>
                        {isCompleted ? 'צפה/שנה' : `צלם/בחר תמונה`}
                    </Text>
                </Pressable>
            </View>
        );
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ 
                title: 'מסע גדילה חודשי',
                headerShown: true,
                headerBackTitle: 'בית',
                headerTitleStyle: { color: theme.text, fontSize: 20, fontWeight: '700' },
                headerTintColor: theme.tint
            }} />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.title, { color: theme.text }]}>בייבי חודש בחודשו</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    עקבו אחר הגדילה של עלמה במשך השנה הראשונה. 
                    האפליקציה תוסיף אוברליי עם מספר החודש באופן אוטומטי.
                </Text>

                <View style={styles.grid}>
                    {Array.from({ length: MAX_MONTHS }, (_, i) => i + 1).map(month => (
                        <MonthCard key={month} month={month} />
                    ))}
                </View>
                
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textMuted} />
                    <Text style={[styles.backButtonText, { color: theme.textMuted }]}>חזרה למסך הבית</Text>
                </Pressable>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 30,
        maxWidth: 400,
    },
    grid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: 15,
    },
    monthCard: {
        width: CARD_WIDTH, // רוחב מחושב
        marginBottom: 15,
        borderRadius: 15,
        padding: 10,
        borderWidth: 1,
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: '100%',
        aspectRatio: 1, // יחס גובה-רוחב 1:1
        borderRadius: 10,
        backgroundColor: '#E6EBF0', 
        marginBottom: 10,
        overflow: 'hidden', // חיתוך האוברליי
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    emptyContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 5,
    },
    completedIcon: {
        fontSize: 40,
        position: 'absolute',
        zIndex: 1,
    },
    actionButton: {
        width: '100%',
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row-reverse',
        gap: 6,
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
    },
    backButton: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
        marginTop: 30,
    },
    backButtonText: {
        fontSize: 16,
    }
});