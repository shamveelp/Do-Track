import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WalletScreen() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <Text style={styles.headerTitle}>My Wallet</Text>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <View style={styles.iconCircle}>
                        <IconSymbol name="wallet.pass" size={60} color="#429690" />
                    </View>
                    <View style={styles.pulse1} />
                    <View style={styles.pulse2} />
                </View>

                <Text style={styles.title}>Coming Soon</Text>
                <Text style={styles.subtitle}>
                    We&apos;re building a smarter way to manage your digital wallet and assets. Stay tuned!
                </Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Under Development</Text>
                </View>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    badgeText: {
        color: '#429690',
        fontWeight: '700',
        fontSize: 14,
    },
});
