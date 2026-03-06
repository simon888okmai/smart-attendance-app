import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/authContext';
import { attendanceService } from '../../services/attendance.service';
import SessionCard from '../components/SessionCard';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

interface SessionData {
    id: string;
    session_name: string;
    start_time: string;
    end_time: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: string;
    in_status?: string;
    isAbsent?: boolean;
}

type SessionStatus = 'waiting_in' | 'waiting_out' | 'done' | 'not_yet' | 'late_waiting_out' | 'late_done' | 'absent' | 'early_checkout';

const SESSIONS_CONFIG = [
    { id: 'morning', title: 'เช้า', emoji: '🌤', start: 8, end: 12 },
    { id: 'lunch', title: 'กลางวัน', emoji: '☀️', start: 12, end: 13 },
    { id: 'afternoon', title: 'บ่าย', emoji: '🌤', start: 13, end: 17 },
    { id: 'evening', title: 'เย็น', emoji: '🌕', start: 17, end: 21 },
];

const HomeScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const lastFetchDate = useRef(new Date().toDateString());

    const fetchStatus = async () => {
        try {
            const baseUrl = api.defaults.baseURL;
            console.log(`[V6-APP] Calling API: ${baseUrl}/attendance/status`);

            const timestamp = new Date().getTime();
            const response = await api.get(`/attendance/status?t=${timestamp}`);
            const data = response.data;

            console.log('[V6-APP] Full Server Response:', JSON.stringify(data, null, 2));

            if (data && data.sessions) {
                setSessions(data.sessions);
            } else {
                setSessions([]);
            }
        } catch (error: any) {
            console.error('[V6-APP] Fetch Error:', error);
            if (error.response?.status === 401) {
                Alert.alert('Session Expired', 'Please Login again');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            setSessions([]);
            fetchStatus();
        }, [])
    );

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            if (now.toDateString() !== lastFetchDate.current) {
                lastFetchDate.current = now.toDateString();
                fetchStatus();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStatus();
    };

    const getSessionUIStatus = (session: SessionData, startHour: number, endHour: number): SessionStatus => {
        const hour = currentTime.getHours();
        const minute = currentTime.getMinutes();
        const hasIn = session.check_in_time !== null && session.check_in_time !== undefined && session.check_in_time !== '';
        const hasOut = session.check_out_time !== null && session.check_out_time !== undefined && session.check_out_time !== '';

        if (session.isAbsent) return 'absent';

        if (hasIn && hasOut) {
            return session.in_status === 'late' ? 'late_done' : 'done';
        }

        if (hasIn && !hasOut) {
            const isTooEarlyToCheckOut = hour < (endHour - 1) || (hour === (endHour - 1) && minute < 45);

            if (isTooEarlyToCheckOut) {
                return 'early_checkout';
            }

            return session.in_status === 'late' ? 'late_waiting_out' : 'waiting_out';
        }

        if (hour >= startHour && hour < endHour) {
            return 'waiting_in';
        }

        return 'not_yet';
    };

    const handlePress = (session: SessionData) => {
        const sessionType = session.check_in_time ? `${session.id}_out` : `${session.id}_in`;
        navigation.navigate('CheckIn', { sessionType });
    };

    const thaiDate = currentTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const thaiTime = currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center items-center">
                <View className="items-center">
                    <ActivityIndicator size="large" color="#3B52E1" />
                    <Text className="mt-4 font-kanit text-[#3B52E1]">กำลังเชื่อมต่อเซิร์ฟเวอร์...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#FFFBEB]">
            <StatusBar barStyle="dark-content" />
            <ScrollView
                className="flex-1 px-8"
                contentContainerStyle={{ paddingTop: 40, paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="mb-2">
                    <Text className="text-3xl font-kanit-bold text-black">{user?.fullName || user?.username || 'ผู้ใช้งาน'}</Text>
                    <Text className="text-xl font-kanit-bold text-black">ตำแหน่ง : {user?.position || 'พนักงาน'}</Text>
                    <View className="h-[2px] bg-black w-full mt-2" />
                </View>

                <View className="items-center mt-6 mb-8">
                    <Text className="text-2xl font-kanit-bold text-[#3B52E1] py-1">วันที่ {thaiDate}</Text>
                    <Text className="text-7xl font-kanit-bold text-[#3B52E1] mt-2 py-2">{thaiTime} น.</Text>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {SESSIONS_CONFIG.map((config) => {
                        const sessionFromState = sessions.find(s => s.id === config.id);
                        const displaySession = sessionFromState || {
                            id: config.id,
                            session_name: config.title,
                            check_in_time: null,
                            check_out_time: null,
                        };

                        return (
                            <SessionCard
                                key={config.id}
                                title={config.title}
                                emoji={config.emoji}
                                status={getSessionUIStatus(displaySession as any, config.start, config.end)}
                                checkInTime={displaySession.check_in_time}
                                checkOutTime={displaySession.check_out_time}
                                onPress={() => handlePress(displaySession as any)}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity onPress={logout} className="mt-8 mb-10 items-center bg-white/50 py-3 rounded-2xl border border-black/5">
                    <Text className="text-gray-400 font-kanit">ออกจากระบบ</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

export default HomeScreen;
