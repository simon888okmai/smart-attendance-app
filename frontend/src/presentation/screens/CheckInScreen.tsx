import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { attendanceService } from '../../services/attendance.service';

const OFFICE_LAT = 13.72557;
const OFFICE_LON = 100.76523;
const MAX_DISTANCE = 200;

type Step = 'ready' | 'checking_location' | 'camera' | 'processing' | 'success' | 'fail';

const SESSION_LABELS: Record<string, string> = {
    morning_in: 'เช้า (เข้า)', morning_out: 'เช้า (ออก)',
    lunch_in: 'กลางวัน (เข้า)', lunch_out: 'กลางวัน (ออก)',
    afternoon_in: 'บ่าย (เข้า)', afternoon_out: 'บ่าย (ออก)',
    evening_in: 'เย็น (เข้า)', evening_out: 'เย็น (ออก)',
};

const CheckInScreen = ({ route, navigation }: any) => {
    const { sessionType } = route.params;
    const sessionLabel = SESSION_LABELS[sessionType] || sessionType;

    const [step, setStep] = useState<Step>('ready');
    const [loading, setLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const checkLocationAndProceed = async () => {
        setStep('checking_location');
        setLoading(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('ต้องการสิทธิ์', 'กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้ง');
                setStep('ready');
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const distance = calculateDistance(
                location.coords.latitude, location.coords.longitude,
                OFFICE_LAT, OFFICE_LON
            );

            if (distance > MAX_DISTANCE) {
                Alert.alert(
                    'อยู่นอกพื้นที่',
                    `คุณอยู่ห่างจากสถานที่ทำงาน ${Math.round(distance)} เมตร\nกรุณาไปยังสถานที่ทำงาน (ภายใน ${MAX_DISTANCE} เมตร)`
                );
                setStep('ready');
                setLoading(false);
                return;
            }

            if (!permission?.granted) {
                const result = await requestPermission();
                if (!result.granted) {
                    Alert.alert('ต้องการสิทธิ์', 'กรุณาอนุญาตการใช้กล้อง');
                    setStep('ready');
                    setLoading(false);
                    return;
                }
            }

            setStep('camera');
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถตรวจสอบตำแหน่งได้');
            setStep('ready');
        } finally {
            setLoading(false);
        }
    };

    const takePictureAndSubmit = async () => {
        if (!cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({ base64: false });
            if (!photo) return;

            setStep('processing');
            setLoading(true);

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

            const result = await attendanceService.checkIn(
                sessionType,
                location.coords.latitude,
                location.coords.longitude,
                photo.uri
            );

            setResultMessage(result.message || 'ลงเวลาสำเร็จ!');
            setStep('success');
        } catch (error: any) {
            const msg = error?.response?.data?.error || 'ใบหน้าไม่ตรงกับระบบ';
            setErrorMessage(msg);
            setStep('fail');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'ready' || step === 'checking_location') {
        return (
            <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center px-10">
                <View className="mb-4">
                    <Text className="text-4xl font-kanit-bold text-[#C02626]">ช่วงเวลา : {sessionLabel.split(' ')[0]}</Text>
                    <View className="h-[3px] bg-[#3B52E1] w-3/4 mt-2" />
                </View>

                <Text className="text-[#C02626] text-lg font-kanit-bold text-center mb-8 mt-6 leading-7">
                    กรุณาถอดแว่น ถอดหมวก{"\n"}และไม่ควรเอาวัตถุมาบังหน้า
                </Text>

                <View className="items-center mb-6">
                    <TouchableOpacity
                        onPress={checkLocationAndProceed}
                        disabled={loading}
                        className={`bg-[#3B52E1] py-3 px-14 rounded-xl shadow-md ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-xl font-kanit-bold">เริ่ม</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <Text className="text-[#C02626] text-sm font-kanit-bold text-center">
                    ** กรุณาไปยังสถานที่ทำงาน **
                </Text>

                <View className="items-center mt-8">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-gray-500 font-kanit text-base underline">กลับสู่หน้าหลัก</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (step === 'camera') {
        return (
            <SafeAreaView className="flex-1 bg-black justify-between">
                <View className="pt-8 items-center">
                    <Text className="text-2xl font-kanit-bold text-white">แสกนใบหน้า</Text>
                    <View className="h-[2px] bg-white w-1/2 mt-2" />
                </View>
                <View className="items-center justify-center flex-1 px-8">
                    <View className="w-full aspect-[3/4] overflow-hidden rounded-3xl border-4 border-[#3B52E1]">
                        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front" />
                    </View>
                </View>
                <View className="items-center pb-10">
                    <TouchableOpacity
                        onPress={takePictureAndSubmit}
                        className="bg-[#3B52E1] py-3 px-10 rounded-xl shadow-md"
                    >
                        <Text className="text-white text-xl font-kanit-bold">ถ่ายภาพ</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (step === 'processing') {
        return (
            <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center items-center">
                <ActivityIndicator size="large" color="#3B52E1" />
                <Text className="text-xl font-kanit-bold text-gray-600 mt-4">กำลังตรวจสอบใบหน้า...</Text>
            </SafeAreaView>
        );
    }

    if (step === 'success') {
        return (
            <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center items-center px-10">
                <Text className="text-3xl font-kanit-bold text-[#65A30D] mb-4">ลงเวลาเสร็จสิ้น</Text>
                <View className="w-24 h-24 bg-[#65A30D] rounded-full justify-center items-center mb-8 shadow-lg">
                    <Text className="text-white text-5xl">✓</Text>
                </View>
                <Text className="text-lg font-kanit text-gray-600 text-center mb-2">{resultMessage}</Text>
                <Text className="text-base font-kanit text-gray-400 mb-8">ช่วงเวลา: {sessionLabel}</Text>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="bg-[#3B52E1] py-3 px-10 rounded-xl shadow-md"
                >
                    <Text className="text-white text-xl font-kanit-bold">เข้าสู่หน้าหลัก</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center items-center px-10">
            <Text className="text-3xl font-kanit-bold text-[#C02626] mb-4">เกิดข้อผิดพลาด</Text>
            <Text className="text-lg font-kanit text-gray-600 text-center mb-2">สาเหตุ</Text>
            <Text className="text-base font-kanit text-gray-500 text-center mb-8">{errorMessage}</Text>

            <TouchableOpacity
                onPress={() => setStep('ready')}
                className="bg-[#3B52E1] py-3 px-10 rounded-xl shadow-md mb-4"
            >
                <Text className="text-white text-lg font-kanit-bold">ลองอีกครั้ง</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-gray-500 font-kanit text-base underline">กลับสู่หน้าหลัก</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-[#C02626] py-3 px-10 rounded-xl shadow-md mt-10">
                <Text className="text-white text-lg font-kanit-bold">ติดต่อเจ้าหน้าที่</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default CheckInScreen;
