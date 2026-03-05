import { Elysia, t } from 'elysia';
import { registerUser, loginUser, updateProfile } from '../controllers/auth';

export const authRoutes = new Elysia({ prefix: '/auth' })
    .post('/register', registerUser, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .post('/login', loginUser, {
        body: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
    .put('/update-profile', updateProfile, {
        body: t.Object({
            userId: t.String(),
            fullName: t.String(),
            position: t.String(),
            faceEmbedding: t.Array(t.Number())
        })
    });