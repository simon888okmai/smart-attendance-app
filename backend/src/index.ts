import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth.ts';
import { attendanceRoutes } from './routes/attendance.ts';

const app = new Elysia()
    .use(cors())
    .onRequest(({ request }) => {
        console.log(`[${request.method}] ${request.url}`);
    })
    .use(authRoutes)
    .use(attendanceRoutes)
    .get('/', () => ({
        status: 'online',
        message: 'Backend API is ready!'
    }))

    .listen({
        port: 3001,
    });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);