import { db } from '../../db';
import { attendanceLogs } from '../../db/schema';
import { calculateDistance } from '../../utils/distance';
import { eq, sql } from 'drizzle-orm';

// อ้างอิงจากโครงสร้างเดิมของคุณ เปลี่ยนชื่อให้ครอบคลุมการลงเวลาทุกแบบ
export const logAttendance = async ({ body, user, set }: any) => {
    // ดึงข้อมูลจาก body โดยเพิ่ม sessionType เข้ามาตามโจทย์
    const { latitude, longitude, currentFaceEmbedding, sessionType } = body;
    const userId = user.id;

    const OFFICE_LAT = 13.72557;
    const OFFICE_LON = 100.76523;
    const MAX_DISTANCE = 200;
    const distance = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LON);

    // ตรวจสอบระยะทาง 200 เมตร (อ้างอิงโค้ดเดิม)
    if (distance > MAX_DISTANCE) {
        set.status = 403;
        return { error: `You are out of the area (Distance: ${Math.round(distance)} meters)` };
    }

    try {
        // --- ส่วน Logic Vector 512 มิติของคุณ (รักษาไว้เหมือนเดิมเป๊ะ) ---
        let embedding = Array.isArray(currentFaceEmbedding) ? currentFaceEmbedding : [];
        if (embedding.length < 512) {
            embedding = [...embedding, ...new Array(512 - embedding.length).fill(0)];
        } else if (embedding.length > 512) {
            embedding = embedding.slice(0, 512);
        }

        const vectorString = `[${embedding.join(',')}]`;
        const userProfile: any = await db.execute(sql`
            SELECT id, (face_embedding <=> ${vectorString}::vector) as distance
            FROM profiles WHERE id = ${userId} LIMIT 1
        `);

        const rawDistance = userProfile.rows ? userProfile.rows[0]?.distance : userProfile[0]?.distance;
        let faceDistance = rawDistance !== null && rawDistance !== undefined ? Number(rawDistance) : undefined;
        const THRESHOLD = 0.4;

        if (faceDistance !== undefined && isNaN(faceDistance)) {
            faceDistance = 1;
        }

        // การคำนวณ Match Percentage เดิมของคุณ
        const matchPercentage = faceDistance !== undefined ? Math.max(0, Math.min(100, Math.round((1 - faceDistance) * 100))) : 0;

        if (faceDistance === undefined || faceDistance > THRESHOLD) {
            set.status = 401;
            let errorMsg = 'Face does not match the registered profile';
            if (faceDistance === undefined) errorMsg = 'User profile not found';
            else if (isNaN(matchPercentage)) errorMsg = 'Invalid face data';

            return {
                error: errorMsg,
                matchPercentage: isNaN(matchPercentage) ? '0%' : `${matchPercentage}%`
            };
        }

        // --- จุดที่ปรับปรุงตาม Schema ใหม่ ---
        await db.insert(attendanceLogs).values({
            userId,
            sessionType: sessionType || 'morning_in', // รับค่าเช้า-เย็นจากแอป
            latitude,
            longitude,
            status: 'success'
            // timestamp จะถูกใส่ค่า defaultNow() โดยอัตโนมัติจาก schema
        });

        return {
            message: `ลงเวลา ${sessionType} สำเร็จ!`,
            distance: Math.round(distance),
            matchPercentage: `${matchPercentage}%`
        };
    } catch (error) {
        console.error(error);
        set.status = 500;
        return { error: 'An error occurred while saving information' };
    }
};