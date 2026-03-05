import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth.ts';
import { attendanceRoutes } from './routes/attendance.ts';

const app = new Elysia()
    .use(cors())
    .use(authRoutes)
    .use(attendanceRoutes)
    .get('/', () => ({
        status: 'online',
        message: 'Backend API is ready!'
    }))

    .listen(3001);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);