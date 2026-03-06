import { db } from '../../db';
import { attendanceLogs } from '../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const getAttendanceHistory = async ({ user, set }: any) => {
    const userId = user.id;

    try {
        const history = await db.query.attendanceLogs.findMany({
            where: eq(attendanceLogs.userId, userId),
            orderBy: [desc(attendanceLogs.timestamp)],
            limit: 50
        });

        return history;
    } catch (error) {
        set.status = 500;
        return { error: 'Failed to load history' };
    }
};