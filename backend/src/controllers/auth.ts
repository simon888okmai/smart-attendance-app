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

    try {
        const userProfile = await db.query.profiles.findFirst({
            where: (profiles, { eq }) => eq(profiles.id, data.user.id)
        });

        if (!userProfile?.isActive) {
            set.status = 403;
            return { error: 'This account has been suspended' };
        }

        return {
            message: 'Login success!',
            token: data.session.access_token,
            userId: data.user.id,
            isCompleted: userProfile.isCompleted,
            fullName: userProfile.fullName,
            position: userProfile.position
        };
    } catch (dbError: any) {
        console.error('[LOGIN DB ERROR]', dbError.message || dbError);
        console.error('[LOGIN DB ERROR FULL]', JSON.stringify(dbError, null, 2));
        set.status = 500;
        return { error: 'Database connection failed', detail: dbError.message };
    }
};

export const updateProfile = async ({ body, set }: any) => {
    const { userId, fullName, position, face_image } = body;

    try {
        let embedding: number[] = [];

        if (face_image) {
            const formData = new FormData();
            formData.append('face_image', face_image);

            const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
            const aiResponse = await fetch(`${aiServiceUrl}/api/face/embedding`, {
                method: 'POST',
                body: formData,
            });

            if (!aiResponse.ok) {
                set.status = 500;
                return { error: 'AI service failed to process image' };
            }

            const aiResult = await aiResponse.json() as {
                embedding: number[];
                face_detected: boolean;
                message: string;
            };

            if (!aiResult.face_detected || aiResult.embedding.length === 0) {
                set.status = 400;
                return { error: 'ไม่พบใบหน้าในรูปภาพ กรุณาถ่ายใหม่' };
            }

            embedding = aiResult.embedding;
        }

        await db.update(profiles)
            .set({
                fullName,
                position,
                faceEmbedding: embedding.length > 0 ? embedding : undefined,
                isCompleted: true
            })
            .where(eq(profiles.id, userId));

        return {
            message: 'Profile updated successfully!',
            isCompleted: true
        };
    } catch (error) {
        set.status = 500;
        return { error: 'An error occurred while updating the profile' };
    }
};