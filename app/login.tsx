import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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

WebBrowser.maybeCompleteAuthSession();


const GOOGLE_ICON = require('@/assets/images/google_icon.png');

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Session will be handled by AuthContext and redirect automatically
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Login Failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        try {
            const redirectUri = Linking.createURL('/google-auth');
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUri,
                },
            });

            if (error) throw error;

            if (data.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

                if (result.type === 'success' && result.url) {
                    const url = result.url;
                    const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        router.replace('/(tabs)');
                    }
                }
            }
        } catch (error: any) {
            Alert.alert('Google Auth Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <IconSymbol name="chevron.left" size={24} color="#333" />
                </TouchableOpacity>
            </SafeAreaView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                        <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>

                        {/* Input Fields */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="yourname@gmail.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <IconSymbol name="envelope" size={20} color="#AAA" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <IconSymbol name={showPassword ? "eye" : "eye.slash"} size={20} color="#AAA" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.forgotBtn}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            style={[styles.signInBtn, loading && styles.btnDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#69A9A4', '#429690']}
                                style={styles.gradientBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.signInText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>or continue with</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Social Buttons */}
                        <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleAuth}>
                            <Image source={GOOGLE_ICON} style={styles.socialIcon} />
                            <Text style={styles.socialBtnText}>Sign in with Google</Text>
                        </TouchableOpacity>

                        {/* Footer Link */}
                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/signup')}>
                                <Text style={styles.footerLink}>Sign Up</Text>
                            </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backBtn: {
        padding: 8,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2E7E78',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#777',
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 25,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#EEE',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 60,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    forgotText: {
        color: '#429690',
        fontSize: 14,
        fontWeight: '600',
    },
    signInBtn: {
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        marginTop: 15,
        shadowColor: '#429690',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    gradientBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signInText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 35,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#AAA',
        fontSize: 14,
    },
    socialBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#EEE',
        borderRadius: 30,
        height: 60,
        backgroundColor: 'white',
        gap: 12,
    },
    socialIcon: {
        width: 24,
        height: 24,
    },
    socialBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    footerText: {
        color: '#777',
        fontSize: 15,
    },
    footerLink: {
        color: '#429690',
        fontSize: 15,
        fontWeight: '700',
    },
});
