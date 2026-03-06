import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = ({ navigation }: any) => {


    return (
        <SafeAreaView className="flex-1 bg-[#FFFAE8]">
            <View className="flex-1 items-center justify-center px-[24px]">

                <View className="items-center mb-12">
                    <Text className="text-4xl font-kanit-extrabold text-blue-600 mb-2">Welcome</Text>
                    <Text className="text-gray-500 text-lg text-center font-kanit">Attendance App</Text>
                </View>

                <TouchableOpacity
                    className="w-full bg-[#3A50E6] py-4 rounded-2xl items-center mb-4 shadow-sm"
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text className="text-white font-kanit-bold text-2xl py-1">เข้าสู่ระบบ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-full py-4 rounded-2xl items-center border-[2px] border-[#3A50E6]"
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text className="text-[#3A50E6] font-kanit-bold text-2xl py-1">สมัครสมาชิก</Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

export default WelcomeScreen;