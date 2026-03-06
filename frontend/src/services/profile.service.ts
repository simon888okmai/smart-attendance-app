import { api } from './api';

const updateProfile = async (userId: string, fullName: string, position: string, faceImageUri?: string) => {
    if (!faceImageUri) {
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

    const uriParts = faceImageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    // @ts-ignore
    formData.append('face_image', {
        uri: faceImageUri,
        name: `face_${userId}.${fileType}`,
        type: `image/${fileType}`,
    } as any);

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