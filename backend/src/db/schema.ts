import { pgTable, uuid, text, timestamp, doublePrecision, customType, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// สร้าง custom type สำหรับ pgvector (คงเดิม)
const vector = customType<{ data: number[] }>({
    dataType() { return 'vector(512)'; },
    toDriver(value: number[]) {
        return `[${value.join(',')}]`;
    },
    fromDriver(value: unknown) {
        if (typeof value === 'string') {
            return value.slice(1, -1).split(',').map(Number);
        }
        return value as number[];
    }
});

export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey(),
    username: text('username').unique(),
    fullName: text('full_name'),
    position: text('position'),
    faceEmbedding: vector('face_embedding'),
    isActive: boolean('is_active').default(true),
    isCompleted: boolean('is_completed').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const attendanceLogs = pgTable('attendance_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => profiles.id),

    /**
     * sessionType จะรองรับ 8 สถานะตามโจทย์:
     * - morning_in, morning_out
     * - lunch_in, lunch_out
     * - afternoon_in, afternoon_out
     * - evening_in, evening_out
     */
    sessionType: text('session_type').notNull(),

    // เปลี่ยนชื่อจาก checkInTime เป็น timestamp ทั่วไปเพื่อให้สื่อความหมายทั้งเข้าและออก [cite: 7]
    timestamp: timestamp('timestamp').defaultNow(),

    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),

    // สถานะการลงเวลา (เช่น success, failed) [cite: 5]
    status: text('status').default('success'),

    // เพิ่มฟิลด์หมายเหตุ (ถ้ามี) สำหรับฝั่งนักศึกษา/อาจารย์ตามโจทย์ข้อ 4 
    note: text('note'),
});

// กำหนดความสัมพันธ์ (คงเดิม)
export const profilesRelations = relations(profiles, ({ many }) => ({
    attendances: many(attendanceLogs),
}));

export const attendanceLogsRelations = relations(attendanceLogs, ({ one }) => ({
    user: one(profiles, {
        fields: [attendanceLogs.userId],
        references: [profiles.id],
    }),
}));