import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { attendanceService } from '../../services/attendance.service';

interface AttendanceLog {
    id: string;
    sessionType: string;
    timestamp: string;
    status: string;
}

const getSessionDisplayName = (sessionType: string) => {
    const parts = sessionType.split('_');
    const type = parts[0];
    const action = parts[1];

    let typeStr = type;
    let emoji = '📌';
    switch (type) {
        case 'morning': typeStr = 'เช้า'; emoji = '🌤'; break;
        case 'lunch': typeStr = 'กลางวัน'; emoji = '☀️'; break;
        case 'afternoon': typeStr = 'บ่าย'; emoji = '🌤'; break;
        case 'evening': typeStr = 'เย็น'; emoji = '🌕'; break;
    }

    const actionStr = action === 'in' ? 'เข้า' : 'ออก';
    return { name: `กะ${typeStr} - ${actionStr}`, emoji };
};

const HistoryScreen = () => {
    const [history, setHistory] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async () => {
        try {
            const data = await attendanceService.getHistory();
            if (Array.isArray(data)) {
                setHistory(data);
            }
        } catch (error) {
            console.error('[History] Fetch Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchHistory();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchHistory();
    };

    const groupedHistory = history.reduce((acc, log) => {
        const dateStr = new Date(log.timestamp).toLocaleDateString('th-TH', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Bangkok'
        });

        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(log);
        return acc;
    }, {} as Record<string, AttendanceLog[]>);

    const sections = Object.keys(groupedHistory).map(date => ({
        date,
        data: groupedHistory[date]
    }));

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-[#FFFBEB] justify-center items-center">
                <ActivityIndicator size="large" color="#3B52E1" />
                <Text className="mt-4 font-kanit text-[#3B52E1]">กำลังโหลดประวัติ...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#FFFBEB]">
            <View className="px-8 pt-8 pb-4">
                <Text className="text-3xl font-kanit-bold text-black mb-2">ประวัติการลงเวลา</Text>
                <View className="h-[2px] bg-black w-full" />
            </View>

            {sections.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-xl font-kanit text-gray-400">ยังไม่มีประวัติการเช็คอิน</Text>
                </View>
            ) : (
                <FlatList
                    className="px-8"
                    data={sections}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item: section }) => (
                        <View className="mb-6">
                            <Text className="text-lg font-kanit-bold text-[#3B52E1] mb-2">{section.date}</Text>
                            <View className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
                                {section.data.map((log, index) => {
                                    const { name, emoji } = getSessionDisplayName(log.sessionType);
                                    const time = new Date(log.timestamp).toLocaleTimeString('th-TH', {
                                        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok'
                                    });

                                    return (
                                        <View key={log.id}>
                                            <View className="flex-row items-center justify-between py-2">
                                                <View className="flex-row items-center">
                                                    <View className="w-10 h-10 bg-[#EEF2FF] rounded-full justify-center items-center mr-3">
                                                        <Text className="text-xl">{emoji}</Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-base font-kanit-bold text-black">{name}</Text>
                                                        {log.status === 'late' ? (
                                                            <Text className="text-xs font-kanit text-[#E57A42]">สถานะ: สาย</Text>
                                                        ) : (
                                                            <Text className="text-xs font-kanit text-gray-500">สถานะ: สำเร็จ</Text>
                                                        )}
                                                    </View>
                                                </View>
                                                <Text className={`text-lg font-kanit-bold ${log.status === 'late' ? 'text-[#E57A42]' : 'text-[#3B52E1]'}`}>
                                                    {time} น.
                                                </Text>
                                            </View>
                                            {/* Divider */}
                                            {index < section.data.length - 1 && (
                                                <View className="h-[1px] bg-gray-100 w-full my-1" />
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

export default HistoryScreen;
