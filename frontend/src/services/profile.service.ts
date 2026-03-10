import { api } from './api';
import { Platform } from 'react-native';

const updateProfile = async (userId: string, fullName: string, position: string, faceImageUri?: string, faceImageBase64?: string) => {
    if (!faceImageUri && !faceImageBase64) {
        const response = await api.put('/auth/update-profile', {
            userId,
            fullName,
            position,
        });
        return response.data;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('fullName', fullName);
    formData.append('position', position);

    if (Platform.OS === 'web' && faceImageBase64) {
        // Handle Base64 (Web)
        try {
            const actualBase64 = faceImageBase64.includes(',') ? faceImageBase64.split(',')[1] : faceImageBase64;
            const byteString = atob(actualBase64);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'image/jpeg' });
            formData.append('face_image', blob, `face_${userId}.jpg`);
        } catch (e) {
            console.error("Failed to convert base64 to blob", e);
        }
    } else if (faceImageUri) {
        // Handle URI (Mobile)
        const uriParts = faceImageUri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';

        // @ts-ignore
        formData.append('face_image', {
            uri: faceImageUri,
            name: `face_${userId}.${fileType}`,
            type: `image/${fileType}`,
        } as any);
    }

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