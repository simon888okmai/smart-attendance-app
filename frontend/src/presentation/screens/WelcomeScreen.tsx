import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = ({ navigation }: any) => {


    return (
        // ใส่ className="flex-1" ที่แรปเปอร์นอกสุด เพื่อให้มันกางเต็มจอ
        <SafeAreaView className="flex-1 bg-[#FFFAE8]">
            <View className="flex-1 items-center justify-center px-[24px]">

                {/* ส่วนหัว (Logo / Title) */}
                <View className="items-center mb-12">
                    <Text className="text-4xl font-kanit-extrabold text-blue-600 mb-2">Welcome</Text>
                    <Text className="text-gray-500 text-lg text-center font-kanit">Attendance App</Text>
                </View>

                {/* ปุ่มเข้าสู่ระบบ */}
                <TouchableOpacity
                    className="w-full bg-[#3A50E6] py-4 rounded-2xl items-center mb-4 shadow-sm"
                    onPress={() => navigation.navigate('Login')} // ไปหน้ากรอกฟอร์ม Login
                >
                    <Text className="text-white font-kanit-bold text-[24px]">เข้าสู่ระบบ</Text>
                </TouchableOpacity>

                {/* ปุ่มสมัครสมาชิก */}
                <TouchableOpacity
                    className="w-full py-4 rounded-2xl items-center border-[2px] border-[#3A50E6]"
                    onPress={() => navigation.navigate('Register')} // ไปหน้ากรอกฟอร์ม Register
                >
                    <Text className="text-[#3A50E6] font-kanit-bold text-[24px]">สมัครสมาชิก</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

export default WelcomeScreen;