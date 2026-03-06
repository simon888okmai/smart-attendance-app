import { api } from './api';

export const attendanceService = {
    getTodayStatus: async () => {
        const response = await api.get('/attendance/status');
        return response.data;
    },

    checkIn: async (
        sessionType: string,
        latitude: number,
        longitude: number,
        faceImageUri: string
    ) => {
        const formData = new FormData();
        formData.append('sessionType', sessionType);
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());

        const uriParts = faceImageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('face_image', {
            uri: faceImageUri,
            name: `checkin_face.${fileType}`,
            type: `image/${fileType}`,
        } as any);

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
