import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/authContext';
import { profileService } from '../../../services/profile.service';
import { CameraView, useCameraPermissions } from 'expo-camera';

const FaceEnrollmentScreen = ({ route }: any) => {
    const { fullName, position } = route.params || {};
    const [step, setStep] = useState<'info' | 'capture' | 'confirm' | 'success'>('info');
    const [loading, setLoading] = useState(false);
    const { user, updateUser } = useAuth();

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const handleStartCapture = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert("จำเป็นต้องใช้กล้อง", "โปรดอนุญาตการใช้กล้องในการตั้งค่าของอุปกรณ์");
                return;
            }
        }
        setStep('capture');
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ base64: true });
                if (photo) {
                    setPhotoUri(photo.uri);
                    setStep('confirm');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถถ่ายภาพได้');
            }
        }
    };

    const handleComplete = async () => {
        if (!user?.id) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
            return;
        }

        setLoading(true);
        try {
            await profileService.updateProfile(user.id, fullName, position, photoUri || undefined);
            await updateUser({ isCompleted: true, fullName, position });
        } catch (error) {
            console.error(error);
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลโพรไฟล์ได้');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'info') {
        return (
            <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center px-10">
                <View className="flex-1 justify-center relative">
                    {/* ขยับหัวข้อขึ้นไปด้านบนนิดหน่อยด้วย absolute positioning ถ้าจำเป็น หรือใช้ margin bottm ดัน */}
                    <View className="mb-16">
                        <Text className="text-4xl font-kanit-bold text-black mb-2 text-center">ลงทะเบียนใบหน้า</Text>
                        <View className="h-[3px] bg-[#3B52E1] w-3/4 mx-auto" />
                    </View>

                    <View className="bg-white/60 p-6 rounded-3xl mb-12 shadow-sm border border-black/5">
                        <Text className="text-[#C02626] text-xl font-kanit-bold text-center leading-8">
                            กรุณาถอดแว่น ถอดหมวก{"\n"}และไม่ควรเอาวัตถุมาบังหน้า
                        </Text>
                    </View>

                    <View className="items-center">
                        <TouchableOpacity onPress={handleStartCapture} className="bg-[#3B52E1] py-4 px-16 rounded-full shadow-lg">
                            <Text className="text-white text-xl font-kanit-bold">เริ่มถ่ายภาพ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (step === 'capture') {
        return (
            <SafeAreaView className="flex-1 bg-black justify-between">
                <View className="pt-10 items-center">
                    <Text className="text-2xl font-kanit-bold text-white text-center">หันหน้าให้ตรงกับกรอบ</Text>
                </View>
                <View className="items-center justify-center flex-1 px-8">
                    <View className="w-full aspect-[3/4] overflow-hidden rounded-3xl border-4 border-[#3B52E1]">
                        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front" />
                    </View>
                </View>
                <View className="items-center pb-12">
                    <TouchableOpacity onPress={takePicture} className="w-20 h-20 bg-white rounded-full border-4 border-[#3B52E1] justify-center items-center shadow-lg">
                        <View className="w-16 h-16 bg-gray-200 rounded-full" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (step === 'confirm') {
        return (
            <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center px-8">
                <Text className="text-3xl font-kanit-bold text-black text-center mb-6">ตรวจสอบรูปภาพ</Text>
                {photoUri && (
                    <View className="items-center justify-center w-full mb-10">
                        <Image source={{ uri: photoUri }} className="w-full aspect-[3/4] rounded-3xl border-2 border-[#3B52E1]" />
                    </View>
                )}
                <View className="flex-row justify-between w-full mt-2">
                    <TouchableOpacity onPress={() => setStep('capture')} disabled={loading} className="bg-gray-400 py-3 rounded-xl flex-1 mr-2 items-center">
                        <Text className="text-white text-lg font-kanit-bold">ถ่ายใหม่</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleComplete} disabled={loading} className={`bg-[#3B52E1] py-3 rounded-xl flex-1 ml-2 items-center shadow-sm ${loading ? 'opacity-70' : ''}`}>
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-kanit-bold">ยืนยันใช้รูปนี้</Text>}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center items-center px-10">
            <ActivityIndicator size="large" color="#3B52E1" />
            <Text className="text-xl font-kanit-bold text-gray-600 mt-4">กำลังเข้าสู่หน้าหลัก...</Text>
        </SafeAreaView>
    );
};

export default FaceEnrollmentScreen;