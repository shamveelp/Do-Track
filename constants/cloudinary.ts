export const CLOUDINARY_CONFIG = {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
};

export const uploadToCloudinary = async (fileUri: string): Promise<string | null> => {
    try {
        const data = new FormData();

        // For React Native, we need to handle the file differently than web
        const filename = fileUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        data.append('file', {
            uri: fileUri,
            name: filename,
            type: type,
        } as any);

        data.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset || '');
        data.append('cloud_name', CLOUDINARY_CONFIG.cloudName || '');

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const result = await response.json();

        if (result.error) {
            console.error('Cloudinary Upload Error:', result.error);
            return null;
        }

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Catch Error:', error);
        return null;
    }
};
