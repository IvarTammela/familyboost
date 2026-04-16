import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import TodayScreen from '../screens/TodayScreen';
import FamilyScreen from '../screens/FamilyScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import GoalsScreen from '../screens/GoalsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';

const Tab = createBottomTabNavigator();

const iconFor = (name) => ({ color, size, focused }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
);

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
            height: 68,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
          tabBarIconStyle: { marginBottom: -2 },
        }}
      >
        <Tab.Screen
          name="Täna"
          component={TodayScreen}
          options={{ tabBarIcon: iconFor('today') }}
        />
        <Tab.Screen
          name="Pere"
          component={FamilyScreen}
          options={{ tabBarIcon: iconFor('people') }}
        />
        <Tab.Screen
          name="Edetabel"
          component={LeaderboardScreen}
          options={{ tabBarIcon: iconFor('trophy') }}
        />
        <Tab.Screen
          name="Minu"
          component={GoalsScreen}
          options={{ tabBarIcon: iconFor('stats-chart') }}
        />
        <Tab.Screen
          name="Ülesanded"
          component={ChallengesScreen}
          options={{ tabBarIcon: iconFor('list') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
