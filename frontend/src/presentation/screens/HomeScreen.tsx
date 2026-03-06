import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/authContext';

const HomeScreen = () => {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-[#F8F9FA]">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">

                {/* Header Section */}
                <View className="flex-row justify-between items-center mb-8 mt-4">
                    <View>
                        <Text className="text-xl font-kanit text-gray-500">สวัสดีครับ,</Text>
                        <Text className="text-3xl font-kanit-bold text-black">{user?.username || 'ผู้ใช้งาน'}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={logout}
                        className="bg-red-500 px-4 py-2 rounded-xl"
                    >
                        <Text className="text-white font-kanit-bold">ออกจากระบบ</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Card */}
                <View className="bg-white p-6 rounded-3xl shadow-sm mb-6 border border-gray-100">
                    <Text className="text-lg font-kanit-bold text-gray-800 mb-2">สถานะวันนี้</Text>
                    <Text className="text-sm font-kanit text-gray-500">คุณยังไม่ได้ลงเวลาเข้างาน</Text>
                </View>

                {/* Check In Action */}
                <View className="items-center justify-center mt-10">
                    <TouchableOpacity
                        className="w-48 h-48 bg-blue-600 rounded-full items-center justify-center shadow-lg border-[8px] border-blue-200"
                    >
                        <Text className="text-white text-2xl font-kanit-bold">ลงเวลา</Text>
                        <Text className="text-white text-sm font-kanit">(Check-In)</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;
