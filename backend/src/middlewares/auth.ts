import { Elysia } from 'elysia';
import { supabase } from '../lib/supabase';

export const authMiddleware = (app: Elysia) => app
    .derive(async ({ headers }) => {
        const authHeader = headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { user: null };
        }

        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabase.auth.getUser(token);

        return { user: user ?? null };
    })
    .onBeforeHandle(({ user, set }) => {
        if (!user) {
            set.status = 401;
            return { error: 'Unauthorized: กรุณาเข้าสู่ระบบใหม่' };
        }
    });