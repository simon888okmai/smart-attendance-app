import { pgTable, uuid, text, timestamp, doublePrecision, customType, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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

    sessionType: text('session_type').notNull(),

    timestamp: timestamp('timestamp').defaultNow(),

    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),

    status: text('status').default('success'),

    note: text('note'),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
    attendances: many(attendanceLogs),
}));

export const attendanceLogsRelations = relations(attendanceLogs, ({ one }) => ({
    user: one(profiles, {
        fields: [attendanceLogs.userId],
        references: [profiles.id],
    }),
}));