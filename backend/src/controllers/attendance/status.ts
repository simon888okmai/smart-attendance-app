import { db } from '../../db';
import { attendanceLogs } from '../../db/schema';
import { and, eq, sql } from 'drizzle-orm';

export const getAttendanceStatus = async ({ user, set }: any) => {
    const userId = user.id;

    try {


        const todayLogs = await db.query.attendanceLogs.findMany({
            where: and(
                eq(attendanceLogs.userId, userId),
                sql`DATE(${attendanceLogs.timestamp} AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') = DATE(NOW() AT TIME ZONE 'Asia/Bangkok')`
            ),
            orderBy: (logs, { asc }) => [asc(logs.timestamp)],
        });

        const sessionConfigs = [
            { id: 'morning', name: 'ช่วงเช้า', start: 8, end: 12, inType: 'morning_in', outType: 'morning_out' },
            { id: 'lunch', name: 'ช่วงกลางวัน', start: 12, end: 13, inType: 'lunch_in', outType: 'lunch_out' },
            { id: 'afternoon', name: 'ช่วงบ่าย', start: 13, end: 17, inType: 'afternoon_in', outType: 'afternoon_out' },
            { id: 'evening', name: 'ช่วงเย็น', start: 17, end: 21, inType: 'evening_in', outType: 'evening_out' },
        ];

        const nowTH = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));
        const currentHour = nowTH.getHours();

        const sessions = sessionConfigs.map(config => {
            const inLog = todayLogs.find(l => l.sessionType === config.inType);
            const outLog = todayLogs.find(l => l.sessionType === config.outType);

            const isAbsent = !inLog && currentHour >= config.end;

            return {
                id: config.id,
                session_name: config.name,
                start_time: `${String(config.start).padStart(2, '0')}:00`,
                end_time: `${String(config.end).padStart(2, '0')}:00`,
                check_in_time: inLog ? new Date(inLog.timestamp!).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }) : null,
                check_out_time: outLog ? new Date(outLog.timestamp!).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }) : null,
                status: (inLog && outLog) ? 'COMPLETED' : 'PENDING',
                in_status: inLog?.status || 'none',
                isAbsent
            };
        });

        return {
            date: new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' }),
            sessions
        };
    } catch (error) {
        console.error('[Status Error]:', error);
        set.status = 500;
        return { error: 'Failed' };
    }
};