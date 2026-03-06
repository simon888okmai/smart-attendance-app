import "../global.css";
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from './presentation/hooks/authContext';
import AppNavigation from './presentation/navigation/AppNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Kanit_400Regular, Kanit_700Bold, Kanit_800ExtraBold } from '@expo-google-fonts/kanit';

export default function App() {
    const [fontsLoaded] = useFonts({
        Kanit_400Regular,
        Kanit_700Bold,
        Kanit_800ExtraBold,
    });

    if (!fontsLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NavigationContainer>
                    <AppNavigation />
                </NavigationContainer>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
