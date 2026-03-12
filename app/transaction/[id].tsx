import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState<any>(null);

    const fetchTransaction = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setTransaction(data);
        } catch (err) {
            console.error('Error fetching transaction:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchTransaction();
        }, [fetchTransaction])
    );

    const handleDelete = async () => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const { error } = await supabase
                                .from('transactions')
                                .delete()
                                .eq('id', id);

                            if (error) throw error;

                            Alert.alert('Success', 'Transaction deleted successfully', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (e: any) {
                            Alert.alert('Error', e.message || 'Failed to delete transaction');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#429690" />
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={styles.container}>
                <Text>Transaction not found</Text>
            </View>
        );
    }

    const category = getCategoryById(transaction.category);
    const isExpense = transaction.type === 'expense';

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Transaction Details</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.detailCard}>
                    <View style={[styles.iconContainer, { backgroundColor: isExpense ? '#FEE2E2' : '#DCFCE7' }]}>
                        <IconSymbol name={category.icon} size={40} color={isExpense ? '#EF4444' : '#22C55E'} />
                    </View>

                    <Text style={styles.title}>{transaction.title}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>

                    <Text style={[styles.amount, { color: isExpense ? '#EF4444' : '#22C55E' }]}>
                        {isExpense ? '-' : '+'} ₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Completed</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Time</Text>
                        <Text style={styles.infoValue}>{new Date(transaction.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                    </View>

                    {transaction.note && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Note</Text>
                            <Text style={styles.infoValue}>{transaction.note}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.btn, styles.editBtn]}
                        onPress={() => router.push({ pathname: '/add-transaction', params: { editId: id } } as any)}
                    >
                        <IconSymbol name="pencil" size={20} color="white" />
                        <Text style={styles.btnText}>Edit Transaction</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.deleteBtn]}
                        onPress={handleDelete}
                    >
                        <IconSymbol name="trash" size={20} color="#EF4444" />
                        <Text style={[styles.btnText, { color: '#EF4444' }]}>Delete Transaction</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 150,
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
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        marginTop: -40,
    },
    detailCard: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
    },
    categoryName: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    amount: {
        fontSize: 32,
        fontWeight: '800',
        marginVertical: 20,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: '#F0F0F0',
        marginVertical: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    infoLabel: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    statusBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        color: '#22C55E',
        fontSize: 12,
        fontWeight: '700',
    },
    actionButtons: {
        marginTop: 30,
        gap: 15,
    },
    btn: {
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    editBtn: {
        backgroundColor: '#429690',
        shadowColor: '#429690',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    deleteBtn: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    btnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
