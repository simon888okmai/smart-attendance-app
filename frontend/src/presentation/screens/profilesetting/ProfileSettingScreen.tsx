// src/presentation/screens/ProfileSettingScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileSettingScreen = ({ navigation }: any) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [position, setPosition] = useState('');

    return (
        <SafeAreaView className="flex-1 bg-[#FFFBEB]">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 justify-center px-10">
                    <View className="mb-10">
                        <Text className="text-4xl font-kanit-bold text-black mb-2">ตั้งค่าโปรไฟล์</Text>
                        <View className="h-[3px] bg-[#3B52E1] w-full" />
                    </View>

                    <View className="space-y-6">
                        <View>
                            <Text className="text-lg font-kanit-bold text-black mb-1">ชื่อ</Text>
                            <TextInput
                                className="w-full h-12 border-[1.5px] border-[#3B52E1] rounded-2xl px-5 bg-white font-kanit"
                                value={firstName} onChangeText={setFirstName}
                            />
                        </View>
                        <View>
                            <Text className="text-lg font-kanit-bold text-black mb-1">นามสกุล</Text>
                            <TextInput
                                className="w-full h-12 border-[1.5px] border-[#3B52E1] rounded-2xl px-5 bg-white font-kanit"
                                value={lastName} onChangeText={setLastName}
                            />
                        </View>
                        <View>
                            <Text className="text-lg font-kanit-bold text-black mb-1">ตำแหน่ง</Text>
                            <TextInput
                                className="w-full h-12 border-[1.5px] border-[#3B52E1] rounded-2xl px-5 bg-white font-kanit"
                                value={position} onChangeText={setPosition}
                            />
                        </View>

                        <View className="items-start mt-8">
                            <TouchableOpacity
                                onPress={() => {
                                    if (!firstName || !lastName || !position) {
                                        Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
                                        return;
                                    }
                                    navigation.navigate('FaceEnrollment', {
                                        fullName: `${firstName} ${lastName}`,
                                        position
                                    });
                                }}
                                className="bg-[#3B52E1] py-2 px-10 rounded-xl"
                            >
                                <Text className="text-white text-lg font-kanit-bold py-1">ต่อไป</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ProfileSettingScreen;