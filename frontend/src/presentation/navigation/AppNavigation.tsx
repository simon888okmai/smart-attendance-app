import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/authContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileSettingScreen from '../screens/profilesetting/ProfileSettingScreen';
import FaceEnrollmentScreen from '../screens/profilesetting/FaceEnrollmentScreen';
import TapBarNavigation from './TapBarNavigation';

const Stack = createStackNavigator();

export default function AppNavigation() {
    const { token, user, isLoading } = useAuth();

    if (isLoading) return null;

    return (
        <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
            {token == null ? (
                <>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : user?.isCompleted === false ? (
                <>
                    <Stack.Screen name="ProfileSetting" component={ProfileSettingScreen} />
                    <Stack.Screen name="FaceEnrollment" component={FaceEnrollmentScreen} />
                </>
            ) : (
                <Stack.Screen name="Main" component={TapBarNavigation} />
            )}
        </Stack.Navigator>
    );
}