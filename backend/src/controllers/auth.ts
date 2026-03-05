import { db } from '../db';
import { eq } from 'drizzle-orm';
import { profiles } from '../db/schema';
import { supabase } from '../lib/supabase';

export const registerUser = async ({ body, set }: any) => {
    const { username, password } = body;
    const fakeEmail = `${username}@test.com`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
    });

    if (authError) {
        set.status = 400;
        return { error: authError.message };
    }

    if (authData.user) {
        await db.insert(profiles).values({
            id: authData.user.id,
            username: username,
            isActive: true,
            isCompleted: false,
        });
        return {
            message: 'Register success!',
            userId: authData.user.id,
            isCompleted: false
        };
    }
};
export const loginUser = async ({ body, set }: any) => {
    const { username, password } = body;
    const fakeEmail = `${username}@test.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password,
    });

    if (error) {
        set.status = 401;
        return { error: 'Invalid username or password' };
    }

    // 2. ดึงข้อมูลโปรไฟล์เพื่อเช็ค isComplete และ isActive
    const userProfile = await db.query.profiles.findFirst({
        where: (profiles, { eq }) => eq(profiles.id, data.user.id)
    });

    // เช็คว่าพนักงานคนนี้ถูกระงับสิทธิ์หรือไม่
    if (!userProfile?.isActive) {
        set.status = 403;
        return { error: 'This account has been suspended' };
    }

    return {
        message: 'Login success!',
        token: data.session.access_token,
        userId: data.user.id,
        isCompleted: userProfile.isCompleted
    };
};

export const updateProfile = async ({ body, set }: any) => {
    const { userId, fullName, position, faceEmbedding } = body;
    console.log("Check Body:", body);

    try {
        // ตีความและปรับ Vector ให้ครบ 512 เติม 0 ส่วนที่ขาด
        let embedding = Array.isArray(faceEmbedding) ? faceEmbedding : [];
        if (embedding.length < 512) {
            embedding = [...embedding, ...new Array(512 - embedding.length).fill(0)];
        } else if (embedding.length > 512) {
            embedding = embedding.slice(0, 512);
        }

        await db.update(profiles)
            .set({
                fullName,
                position,
                faceEmbedding: embedding,
                isCompleted: true
            })
            .where(eq(profiles.id, userId));

        return {
            message: 'Profile updated successfully!',
            isCompleted: true
        };
    } catch (error) {
        console.error("DB Error:", error);
        set.status = 500;
        return { error: 'An error occurred while updating the profile' };
    }
};