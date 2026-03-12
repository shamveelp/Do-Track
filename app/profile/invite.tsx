import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InviteFriendsScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Invite Friends</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <View style={styles.iconCircle}>
                        <IconSymbol name="diamond" size={60} color="#429690" />
                    </View>
                    <View style={styles.pulse1} />
                    <View style={styles.pulse2} />
                </View>

                <Text style={styles.title}>Coming Soon</Text>
                <Text style={styles.subtitle}>
                    Our referral and reward program is currently in development. Soon you&apos;ll be able to invite friends and earn exclusive perks!
                </Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Referral Program Underway</Text>
                </View>

                <TouchableOpacity
                    style={styles.notifyBtn}
                    onPress={() => router.back()}
                >
                    <Text style={styles.notifyText}>Back to Profile</Text>
                </TouchableOpacity>
            </View>
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        marginTop: -30,
    },
    illustrationContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F0F6F5',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    pulse1: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F0F6F5',
        opacity: 0.6,
    },
    pulse2: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: '#F0F6F5',
        opacity: 0.3,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#333',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    badge: {
        backgroundColor: '#E6F4F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#42969040',
        marginBottom: 40,
    },
    badgeText: {
        color: '#429690',
        fontWeight: '700',
        fontSize: 14,
    },
    notifyBtn: {
        width: '100%',
        backgroundColor: '#429690',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    notifyText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
