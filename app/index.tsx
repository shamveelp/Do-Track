import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const router = useRouter();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#429690', '#2E7E78']}
                style={styles.background}
            >
                {/* Decorative background shapes */}
                <View style={[styles.circle, { top: -100, left: -50, width: 300, height: 300, opacity: 0.12 }]} />
                <View style={[styles.circle, { bottom: -60, right: -60, width: 250, height: 250, opacity: 0.1 }]} />

                <View style={styles.content}>
                    <Animated.View
                        style={[
                            styles.logoBox,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        <View style={styles.logoInner}>
                            <Text style={styles.logoText}>D</Text>
                        </View>
                    </Animated.View>

                    <Animated.Text
                        style={[
                            styles.appName,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        Do-Track
                    </Animated.Text>

                    <Animated.Text
                        style={[
                            styles.subtitle,
                            {
                                opacity: fadeAnim
                            }
                        ]}
                    >
                        Manage Your Money Smarter
                    </Animated.Text>
                </View>

                {/* Branding indicator at bottom */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Made by AntiGravity</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: 'white',
    },
    content: {
        alignItems: 'center',
    },
    logoBox: {
        width: 90,
        height: 90,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: 20,
    },
    logoInner: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 45,
        fontWeight: '900',
        color: '#2E7E78',
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
        fontWeight: '400',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        letterSpacing: 1,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
});
