import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/auth.service';

const RegisterScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);
        try {
            await authService.register(username, password);
            if (Platform.OS === 'web') {
                window.alert('สมัครสมาชิกเรียบร้อยแล้ว');
                navigation.navigate('Login');
            } else {
                Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว', [
                    { text: 'ตกลง', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ (อาจมีผู้ใช้งานชื่อนี้แล้ว)';
            if (Platform.OS === 'web') {
                window.alert(`เกิดข้อผิดพลาด: ${errorMsg}`);
            } else {
                Alert.alert('เกิดข้อผิดพลาด', errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FFFBEB]">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <View className="flex-1 justify-center px-10 py-10">

                        {/* หัวข้อสมัครสมาชิก */}
                        <View className="mb-8 mt-4">
                            <Text className="text-4xl font-kanit-bold text-black py-1 mb-2">สมัครสมาชิก</Text>
                            <View className="h-[3px] bg-blue-600 w-full" />
                        </View>

                        {/* ฟอร์มกรอกข้อมูล */}
                        <View className="space-y-6">
                            <View>
                                <Text className="text-lg font-kanit-bold text-black mb-2">ชื่อผู้ใช้</Text>
                                <TextInput
                                    className="w-full h-14 border-2 border-blue-600 rounded-full px-6 bg-white text-lg font-kanit"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View>
                                <Text className="text-lg font-kanit-bold text-black mb-2">รหัสผ่าน</Text>
                                <TextInput
                                    className="w-full h-14 border-2 border-blue-600 rounded-full px-6 bg-white text-lg font-kanit"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <View>
                                <Text className="text-lg font-kanit-bold text-black mb-2">ยืนยันรหัสผ่าน</Text>
                                <TextInput
                                    className="w-full h-14 border-2 border-blue-600 rounded-full px-6 bg-white text-lg font-kanit"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>

                            {/* ปุ่มยืนยัน */}
                            <View className="items-center mt-6">
                                <TouchableOpacity
                                    onPress={handleRegister}
                                    disabled={loading}
                                    className={`bg-[#3B52E1] py-3 px-12 rounded-2xl shadow-md w-full items-center ${loading ? 'opacity-70' : ''}`}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white text-xl font-kanit-bold text-center">ยืนยันการสมัคร</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* กลับไปหน้าเข้าสู่ระบบ */}
                            <View className="items-center mt-4 pb-10">
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text className="text-lg font-kanit text-blue-600 underline">มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;
