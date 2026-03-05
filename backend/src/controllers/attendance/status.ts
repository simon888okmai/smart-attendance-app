import { db } from '../../db';
import { attendanceLogs } from '../../db/schema';
import { desc, eq, and, sql } from 'drizzle-orm';

export const getAttendanceStatus = async ({ user, set }: any) => {
    const userId = user.id;

    try {
        // ดึงสถานะล่าสุดของวันนี้ (อ้างอิงจากประวัติล่าสุดของคุณ)
        const lastLog = await db.query.attendanceLogs.findFirst({
            where: and(
                eq(attendanceLogs.userId, userId),
                // เช็คเฉพาะของวันนี้เท่านั้น
                sql`DATE(${attendanceLogs.timestamp}) = CURRENT_DATE`
            ),
            orderBy: [desc(attendanceLogs.timestamp)],
        });

        return {
            lastStatus: lastLog?.sessionType || 'none', // ถ้าไม่มีเลยให้เป็น none
            lastTimestamp: lastLog?.timestamp || null
        };
    } catch (error) {
        set.status = 500;
        return { error: 'ไม่สามารถโหลดสถานะปัจจุบันได้' };
    }
};