import { Elysia } from 'elysia';
import { logAttendance } from '../controllers/attendance/logAttendance';
import { getAttendanceHistory } from '../controllers/attendance/history';
import { authMiddleware } from '../middlewares/auth';
import { getAttendanceStatus } from '../controllers/attendance/status';

export const attendanceRoutes = new Elysia({ prefix: '/attendance' })
    .use(authMiddleware)
    .get('/history', getAttendanceHistory)
    .post('/log-attendance', logAttendance)
    .get('/status', getAttendanceStatus);