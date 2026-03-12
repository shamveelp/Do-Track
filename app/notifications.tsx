import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();
    const [loading] = useState(false);

    // Mock notifications for now as there's no backend table for them yet
    const NOTIFICATIONS = [
        {
            id: '1',
            title: 'Welcome to Do-Track!',
            message: 'Start tracking your expenses and save more money today.',
            time: '2 hours ago',
            type: 'info',
            read: false,
        },
        {
            id: '2',
            title: 'Salary Credited',
            message: 'Your salary of ₹75,000 has been added to your records.',
            time: 'Yesterday',
            type: 'success',
            read: true,
        },
        {
            id: '3',
            title: 'Security Alert',
            message: 'A new login was detected from a Chrome browser on Windows.',
            time: '2 days ago',
            type: 'warning',
            read: true,
        },
    ];

    const renderNotification = ({ item }: { item: any }) => (
        <TouchableOpacity style={[styles.notificationCard, !item.read && styles.unreadCard]}>
            <View style={[styles.iconContainer,
            item.type === 'success' ? styles.successIcon :
                item.type === 'warning' ? styles.warningIcon : styles.infoIcon
            ]}>
                <IconSymbol
                    name={item.type === 'warning' ? 'shield' : item.type === 'success' ? 'checkmark.circle' : 'bell'}
                    size={24}
                    color="white"
                />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.textHeader}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Message Center</Text>
                    <TouchableOpacity style={styles.clearBtn}>
                        <Text style={styles.clearText}>Clear all</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#429690" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={NOTIFICATIONS}
                        renderItem={renderNotification}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listPadding}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <IconSymbol name="bell.slash" size={60} color="#DDD" />
                                <Text style={styles.emptyText}>No notifications yet</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    header: {
        height: 130,
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
    clearBtn: {
        padding: 5,
    },
    clearText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
    content: {
        flex: 1,
        marginTop: -30,
    },
    listPadding: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#429690',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoIcon: { backgroundColor: '#429690' },
    successIcon: { backgroundColor: '#22C55E' },
    warningIcon: { backgroundColor: '#F59E0B' },
    textContainer: {
        flex: 1,
    },
    textHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    notifTime: {
        fontSize: 12,
        color: '#999',
    },
    notifMessage: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#429690',
        marginLeft: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#BBB',
        marginTop: 15,
        fontWeight: '600',
    },
});
