import { IconSymbol } from '@/components/ui/icon-symbol';
import { uploadToCloudinary } from '@/constants/cloudinary';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_AVATAR = 'https://res.cloudinary.com/drmroxs00/image/upload/v1741709497/user_avatar_placeholder.png';

export default function EditProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setName(user.user_metadata?.full_name || '');
                setPhone(user.user_metadata?.phone || '');
                setBio(user.user_metadata?.bio || '');
                setAvatarUrl(user.user_metadata?.avatar_url || DEFAULT_AVATAR);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            handleUpload(result.assets[0].uri);
        }
    };

    const handleUpload = async (uri: string) => {
        try {
            setUploading(true);
            const uploadedUrl = await uploadToCloudinary(uri);
            if (uploadedUrl) {
                setAvatarUrl(uploadedUrl);
            } else {
                Alert.alert('Upload Failed', 'Could not upload image to Cloudinary');
            }
        } catch (error) {
            console.error('Upload Error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: name,
                    phone: phone,
                    bio: bio,
                    avatar_url: avatarUrl
                }
            });

            if (error) throw error;
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Personal Profile</Text>
                    <TouchableOpacity onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.saveText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {uploading ? (
                                <View style={[styles.avatar, styles.uploadingOverlay]}>
                                    <ActivityIndicator color="#429690" />
                                </View>
                            ) : (
                                <Image
                                    source={{ uri: avatarUrl }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                    transition={500}
                                    cachePolicy="disk"
                                />
                            )}
                            <TouchableOpacity style={styles.editBadge} onPress={pickImage} disabled={uploading}>
                                <IconSymbol name="camera" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.changePic}>Tap to change picture</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>FULL NAME</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>PHONE NUMBER</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+91 00000 00000"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>BIO</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        height: 120,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '800',
    },
    saveText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        padding: 25,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 10,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        padding: 4,
        borderWidth: 2,
        borderColor: '#42969040',
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 56,
    },
    editBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#429690',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    changePic: {
        marginTop: 12,
        color: '#429690',
        fontWeight: '600',
        fontSize: 14,
    },
    form: {
        gap: 25,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#999',
        letterSpacing: 1.5,
    },
    input: {
        backgroundColor: '#F8F8F8',
        borderRadius: 15,
        padding: 18,
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    uploadingOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F6F5',
    }
});
