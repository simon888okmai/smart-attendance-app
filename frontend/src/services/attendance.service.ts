import { api } from './api';
import { Platform } from 'react-native';

export const attendanceService = {
    getTodayStatus: async () => {
        const response = await api.get('/attendance/status');
        return response.data;
    },

    checkIn: async (
        sessionType: string,
        latitude: number,
        longitude: number,
        faceImageUri?: string,
        faceImageBase64?: string
    ) => {
        const formData = new FormData();
        formData.append('sessionType', sessionType);
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());

        if (Platform.OS === 'web' && faceImageBase64) {
            try {
                const actualBase64 = faceImageBase64.includes(',') ? faceImageBase64.split(',')[1] : faceImageBase64;
                const byteString = atob(actualBase64);
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: 'image/jpeg' });
                formData.append('face_image', blob, 'checkin_face.jpg');
            } catch (e) {
                console.error("Failed to convert base64 to blob", e);
            }
        } else if (faceImageUri) {
            const uriParts = faceImageUri.split('.');
            const fileType = uriParts[uriParts.length - 1] || 'jpg';

            // @ts-ignore
            formData.append('face_image', {
                uri: faceImageUri,
                name: `checkin_face.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }

        const response = await api.post('/attendance/log-attendance', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/attendance/history');
        return response.data;
    },
};
