import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountInfoScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
        <View style={styles.infoRow}>
            <View style={styles.iconBox}>
                <IconSymbol name={icon as any} size={22} color="#429690" />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'Not set'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Info</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#429690" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Registration Details</Text>
                            <InfoRow label="Email Address" value={user?.email} icon="envelope" />
                            <InfoRow label="User ID" value={user?.id?.substring(0, 12) + '...'} icon="person" />
                            <InfoRow label="Registration Date" value={new Date(user?.created_at).toLocaleDateString()} icon="calendar" />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Account Status</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>Verified</Text>
                                </View>
                                <Text style={styles.lastLogin}>Last login: {new Date(user?.last_sign_in_at).toLocaleDateString()}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => Alert.alert('Request Submitted', 'A request to delete your data has been sent to the administrator.')}
                        >
                            <Text style={styles.deleteBtnText}>Request Data Deletion</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
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
        padding: 25,
        marginTop: -30,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 20,
        opacity: 0.6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F6F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        color: '#22C55E',
        fontSize: 12,
        fontWeight: '800',
    },
    lastLogin: {
        fontSize: 12,
        color: '#999',
    },
    deleteBtn: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#F27480',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
});
