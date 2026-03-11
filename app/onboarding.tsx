import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// 3D character generated for onboarding
const CHARACTER_IMAGE = require('@/assets/images/onboarding_character.png');

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Top Illustration Area */}
            <View style={styles.illustrationArea}>
                {/* Decorative background circles like in the image */}
                <View style={[styles.bgCircle, { width: width * 1.5, height: width * 1.5, top: -width * 0.4, opacity: 0.03 }]} />
                <View style={[styles.bgCircle, { width: width * 1.2, height: width * 1.2, top: -width * 0.2, opacity: 0.05 }]} />
                <View style={[styles.bgCircle, { width: width * 0.9, height: width * 0.9, top: 0, opacity: 0.08 }]} />

                <Image
                    source={CHARACTER_IMAGE}
                    style={styles.characterImg}
                    resizeMode="contain"
                />
            </View>

            {/* Bottom Content Area */}
            <View style={styles.contentArea}>
                <Text style={styles.title}>Spend Smarter{"\n"}Save More</Text>

                <TouchableOpacity
                    style={styles.getStartedBtn}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <LinearGradient
                        colors={['#69A9A4', '#429690']}
                        style={styles.gradientBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.loginRow}>
                    <Text style={styles.alreadyText}>Already Have Account? </Text>
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text style={styles.loginLink}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FEFD',
    },
    illustrationArea: {
        flex: 1.4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EAF6F5',
        overflow: 'hidden',
    },
    bgCircle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: '#429690',
        alignSelf: 'center',
    },
    characterImg: {
        width: width * 0.85,
        height: height * 0.5,
        marginTop: 40,
        zIndex: 10,
    },
    contentArea: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        alignItems: 'center',
        paddingTop: 40,
        marginTop: -40, // overlap
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#2E7E78',
        textAlign: 'center',
        lineHeight: 42,
        marginBottom: 40,
    },
    getStartedBtn: {
        width: '100%',
        height: 65,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#429690',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    gradientBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    getStartedText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    alreadyText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#429690',
        fontSize: 14,
        fontWeight: '700',
    },
});
