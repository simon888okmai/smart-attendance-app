// src/services/profile.service.ts
import { api } from './api';

const updateProfile = async (userId: string, fullName: string, position: string, faceImageUri?: string) => {
    // กรณีอัปเดตข้อมูลทั่วไป (JSON)
    if (!faceImageUri) {
        const response = await api.put('/auth/update-profile', {
            userId,
            fullName,
            position,
        });
        return response.data;
    }

    // กรณีส่งรูปภาพใบหน้า (Multipart/Form-Data)
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('fullName', fullName);
    formData.append('position', position);

    // จัดการไฟล์รูปภาพ
    const uriParts = faceImageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    // @ts-ignore
    formData.append('face_image', {
        uri: faceImageUri,
        name: `face_${userId}.${fileType}`,
        type: `image/${fileType}`,
    });

    const response = await api.put('/auth/update-profile', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const profileService = {
    updateProfile
};