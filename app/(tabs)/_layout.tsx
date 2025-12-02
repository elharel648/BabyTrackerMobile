import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { EventsProvider } from '../../src/context/EventsProvider'; // 👈 Provider

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <EventsProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >

        {/* מסך בית */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'בית',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />

        {/* מסך נתונים חדש */}
        <Tabs.Screen
          name="data"
          options={{
            title: 'נתונים',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="chart.bar.fill" color={color} />
            ),
          }}
        />

        {/* Explore יישאר למסכים עתידיים */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'עוד',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />

      </Tabs>
    </EventsProvider>
  );
}
