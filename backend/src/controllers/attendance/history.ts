import { db } from '../../db';
import { attendanceLogs } from '../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const getAttendanceHistory = async ({ user, set }: any) => {
    const userId = user.id;

    try {
        const history = await db.query.attendanceLogs.findMany({
            where: eq(attendanceLogs.userId, userId),
            // แก้จาก checkInTime เป็น timestamp ตาม schema ใหม่
            orderBy: [desc(attendanceLogs.timestamp)],
            limit: 50
        });

        return history;
    } catch (error) {
        console.error("History Error:", error);
        set.status = 500;
        return { error: 'ไม่สามารถโหลดข้อมูลประวัติได้ในขณะนี้' };
    }
};