import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

// Placeholder for ProfileScreen
const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontFamily: 'kanit-bold', fontSize: 24 }}>ข้อมูลส่วนตัว</Text>
  </View>
);

export default function TapBarNavigation() {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B52E1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'kanit',
          fontSize: 12,
        }
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'หน้าหลัก',
          // tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} /> // Add icons later
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'โปรไฟล์',
          // tabBarIcon: ({ color, size }) => <Icon name="person" color={color} size={size} /> // Add icons later
        }}
      />
    </Tab.Navigator>
  );
}