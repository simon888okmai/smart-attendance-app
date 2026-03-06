import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/authContext'; //
import { authService } from '../../services/auth.service';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // ดึงฟังก์ชัน login จาก Context

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }

        setLoading(true);
        try {
            // เรียกใช้ Service เพื่อยิง API
            const response = await authService.login(username, password);

            if (response.token) {
                // เก็บ Token ลงเครื่องและเปลี่ยนสถานะเป็น Login
                await login(response.token, { id: response.userId || '', username, isCompleted: response.isCompleted || false });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            Alert.alert('เข้าสู่ระบบไม่สำเร็จ', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FFFBEB]">
            <View className="flex-1 justify-center px-10">

                {/* หัวข้อเข้าสู่ระบบ */}
                <View className="mb-8">
                    <Text className="text-4xl font-kanit-bold text-black mb-2">เข้าสู่ระบบ</Text>
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

                    {/* ปุ่มยืนยัน */}
                    <View className="items-center mt-6">
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className={`bg-[#3B52E1] py-3 px-12 rounded-2xl shadow-md ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-xl font-kanit-bold text-center">ยืนยัน</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;