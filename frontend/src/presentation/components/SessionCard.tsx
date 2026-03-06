import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type SessionStatus = 'waiting_in' | 'waiting_out' | 'done' | 'not_yet' | 'late_waiting_out' | 'late_done' | 'absent' | 'early_checkout';

interface SessionCardProps {
    title: string;
    emoji: string;
    status: SessionStatus;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    onPress: () => void;
}

const STATUS_CONFIG: Record<SessionStatus, { label: string; bg: string }> = {
    waiting_in: { label: 'รอลงเวลาเข้า', bg: 'bg-[#E5B842]' },
    waiting_out: { label: 'รอลงเวลาออก', bg: 'bg-[#E5B842]' },
    done: { label: 'เสร็จสิ้น', bg: 'bg-[#4F9E2F]' },
    not_yet: { label: 'ยังไม่ถึงเวลา', bg: 'bg-[#7F7F7F]' },
    late_waiting_out: { label: 'สาย (รอเวลาออก)', bg: 'bg-[#E57A42]' }, // สีส้ม
    late_done: { label: 'สาย (เสร็จสิ้น)', bg: 'bg-[#E57A42]' },
    absent: { label: 'ขาดลงเวลา', bg: 'bg-[#D32F2F]' }, // สีแดง
    early_checkout: { label: 'ยังไม่ถึงเวลาออก', bg: 'bg-[#7F7F7F]' }, // เหมือน not_yet แต่เฉพาะรอออก
};

const SessionCard: React.FC<SessionCardProps> = ({ title, emoji, status, checkInTime, checkOutTime, onPress }) => {
    const config = STATUS_CONFIG[status];

    const timeToDisplay = checkOutTime || checkInTime || '--:--';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={status === 'done' || status === 'not_yet' || status === 'early_checkout'}
            className={`${config.bg} rounded-[25px] w-[46%] aspect-square p-4 items-center justify-center mb-4 shadow-sm`}
            style={{ elevation: 4 }}
            activeOpacity={0.7}
        >
            <Text className="text-4xl mb-1">{emoji}</Text>
            <Text className="text-xl font-kanit-bold text-white mb-1">{title}</Text>

            <View className="items-center">
                <Text className="text-[10px] font-kanit text-white opacity-90">สถานะ : {config.label}</Text>
                <Text className="text-[10px] font-kanit text-white opacity-90">เวลาที่ลง : {timeToDisplay} น.</Text>
            </View>
        </TouchableOpacity>
    );
};

export default SessionCard;
