import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme(); //Rileva il tema 'light' o 'dark' del dispositivo

  return (
    //implementazione dello stile diverso in base al tema
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff',
          borderTopWidth: 1,
          borderColor: colorScheme === 'dark' ? '#1e293b' : '#e2e8f0',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        }
      }}>
      
 
      <Tabs.Screen
      //divisione delle diverse schermate del tab, se selezioniamo una pagina la sua icona del tab si colora
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "home" : "home-outline"} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "cube" : "cube-outline"} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "calendar" : "calendar-outline"} color={color} />
          ),
        }}
      />

    
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "restaurant" : "restaurant-outline"} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Shopping',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? "cart" : "cart-outline"} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}