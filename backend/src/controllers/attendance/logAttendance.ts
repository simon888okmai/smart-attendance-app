import { db } from '../../db';
import { attendanceLogs } from '../../db/schema';
import { calculateDistance } from '../../utils/distance';
import { eq, sql } from 'drizzle-orm';

const OFFICE_LAT = 13.72557;
const OFFICE_LON = 100.76523;
const MAX_DISTANCE = 200;
const FACE_THRESHOLD = 0.4;

export const logAttendance = async ({ body, user, set }: any) => {
    const { latitude, longitude, sessionType, face_image } = body;
    const userId = user.id;

    const distance = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LON);

    if (distance > MAX_DISTANCE) {
        set.status = 403;
        return { error: `คุณอยู่นอกพื้นที่ (ระยะห่าง: ${Math.round(distance)} เมตร)` };
    }

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
        } else {
            set.status = 400;
            return { error: 'กรุณาถ่ายรูปใบหน้า' };
        }

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

        if (faceDistance !== undefined && isNaN(faceDistance)) {
            faceDistance = 1;
        }

        const matchPercentage = faceDistance !== undefined
            ? Math.max(0, Math.min(100, Math.round((1 - faceDistance) * 100)))
            : 0;

        if (faceDistance === undefined || faceDistance > FACE_THRESHOLD) {
            set.status = 401;
            return {
                error: 'ใบหน้าไม่ตรงกับระบบ',
                matchPercentage: `${matchPercentage}%`
            };
        }

        const sessionConfigs: Record<string, { startHour: number, endHour: number }> = {
            'morning': { startHour: 8, endHour: 12 },
            'lunch': { startHour: 12, endHour: 13 },
            'afternoon': { startHour: 13, endHour: 17 },
            'evening': { startHour: 17, endHour: 21 }
        };

        const sessionPrefix = sessionType.split('_')[0];
        const isCheckIn = sessionType.endsWith('_in');
        const isCheckOut = sessionType.endsWith('_out');

        let attendanceStatus = 'success';
        let isLate = false;

        if (isCheckIn && sessionConfigs[sessionPrefix]) {
            const now = new Date();
            const startHour = sessionConfigs[sessionPrefix].startHour;

            const lateThreshold = new Date();
            lateThreshold.setHours(startHour, 15, 0, 0);

            if (now > lateThreshold) {
                attendanceStatus = 'late';
                isLate = true;
            }
        }

        if (isCheckOut && sessionConfigs[sessionPrefix]) {
            const now = new Date();
            const endHour = sessionConfigs[sessionPrefix].endHour;

            const checkoutThreshold = new Date();
            checkoutThreshold.setHours(endHour - 1, 45, 0, 0);

            if (now < checkoutThreshold) {
                set.status = 403;
                return { error: `ยังไม่ถึงเวลาสแกนออก (สามารถสแกนออกได้ตั้งแต่เวลา ${String(endHour - 1).padStart(2, '0')}:45 น. เป็นต้นไป)` };
            }
        }

        await db.insert(attendanceLogs).values({
            userId,
            sessionType: sessionType || 'morning_in',
            latitude,
            longitude,
            status: attendanceStatus
        });

        return {
            message: `ลงเวลา ${sessionType} สำเร็จ!${isLate ? ' (มาสาย)' : ''}`,
            distance: Math.round(distance),
            matchPercentage: `${matchPercentage}%`
        };
    } catch (error) {
        console.error(error);
        set.status = 500;
        return { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
    }
};