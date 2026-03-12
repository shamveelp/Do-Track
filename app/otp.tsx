import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function OTPScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<TextInput[]>([]);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyEmail = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            Alert.alert('Error', 'Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email: email!,
                token: otpString,
                type: 'signup',
            });

            if (error) throw error;
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Verification Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email!,
            });
            if (error) throw error;
            Alert.alert('Success', 'A new verification code has been sent to your email.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
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
                <View style={styles.content}>
                    <Text style={styles.title}>Verification</Text>
                    <Text style={styles.subtitle}>Enter the code sent to your email{"\n"}{email}</Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { if (el) inputRefs.current[index] = el; }}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
                        onPress={handleVerifyEmail}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#69A9A4', '#429690']}
                            style={styles.gradientBtn}
                        >
                            <Text style={styles.verifyText}>{loading ? 'Verifying...' : 'Verify Email'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.resendRow}>
                        <Text style={styles.resendText}>Didn&apos;t receive code? </Text>
                        <TouchableOpacity onPress={handleResendOTP}>
                            <Text style={styles.resendLink}>Resend</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    content: {
        paddingHorizontal: 30,
        paddingTop: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2E7E78',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderColor: '#EEE',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: '#2E7E78',
        backgroundColor: '#F9F9F9',
    },
    verifyBtn: {
        width: '100%',
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        marginTop: 10,
        shadowColor: '#429690',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    verifyBtnDisabled: {
        opacity: 0.7,
    },
    gradientBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    resendRow: {
        flexDirection: 'row',
        marginTop: 30,
    },
    resendText: {
        color: '#777',
        fontSize: 15,
    },
    resendLink: {
        color: '#429690',
        fontSize: 15,
        fontWeight: '700',
    },
});
