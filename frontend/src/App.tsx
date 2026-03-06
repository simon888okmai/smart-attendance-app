import "../global.css"; // 1. Import CSS ของ NativeWind เข้ามาที่นี่
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from './presentation/hooks/authContext'; // 2. ดึง Provider ที่เราทำไว้มาใช้
import AppNavigation from './presentation/navigation/AppNavigation'; // 3. ดึง Navigation หลักมา
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Kanit_400Regular, Kanit_700Bold, Kanit_800ExtraBold } from '@expo-google-fonts/kanit';

export default function App() {
    // 4. โหลดฟอนต์ก่อนแสดงผลหน้าแอป
    const [fontsLoaded] = useFonts({
        Kanit_400Regular,
        Kanit_700Bold,
        Kanit_800ExtraBold,
    });

    // ถ้าระบบยังโหลดฟอนต์ไม่เสร็จให้โชว์เป็นหน้าหมุนโหลดไปก่อน
    if (!fontsLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        // หุ้มด้วย AuthProvider และ NavigationContainer เพื่อให้ context ทำงานได้ครอบคลุม
        <SafeAreaProvider>
            <AuthProvider>
                <NavigationContainer>
                    <AppNavigation />
                </NavigationContainer>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
