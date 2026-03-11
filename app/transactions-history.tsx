import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_SIZE = 15;

export default function TransactionsHistoryScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyStats, setDailyStats] = useState<Record<string, { income: number; expense: number }>>({});
    const [showMonthYearGrid, setShowMonthYearGrid] = useState(false);
    const [gridMode, setGridMode] = useState<'month' | 'year'>('month');

    const today = new Date();

    useFocusEffect(
        useCallback(() => {
            fetchTransactions(true);
            fetchMonthlyStats();
        }, [])
    );

    const fetchTransactions = async (refresh = false) => {
        if ((loading && !refresh) || loadingMore || (!hasMore && !refresh)) return;

        if (refresh) setLoading(true);
        else setLoadingMore(true);

        try {
            const start = refresh ? 0 : page * PAGE_SIZE;
            const end = start + PAGE_SIZE - 1;

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
                .range(start, end);

            if (error) throw error;

            if (refresh) {
                setTransactions(data || []);
                setPage(1);
                setHasMore(data?.length === PAGE_SIZE);
            } else {
                setTransactions(prev => {
                    const newData = data || [];
                    const existingIds = new Set(prev.map(t => t.id));
                    const uniqueNewData = newData.filter(t => !existingIds.has(t.id));
                    return [...prev, ...uniqueNewData];
                });
                setPage(prev => prev + 1);
                setHasMore(data?.length === PAGE_SIZE);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchMonthlyStats = async () => {
        // This is a bit complex for a single query, but we can fetch transactions for the current month
        // and group them. For simplicity, we'll fetch all transactions for now or a reasonable range.
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('date, amount, type');

            if (error) throw error;

            const stats: Record<string, { income: number; expense: number }> = {};
            data?.forEach(t => {
                const dateStr = t.date.split('T')[0];
                if (!stats[dateStr]) stats[dateStr] = { income: 0, expense: 0 };
                if (t.type === 'income') stats[dateStr].income += parseFloat(t.amount);
                else stats[dateStr].expense += parseFloat(t.amount);
            });
            setDailyStats(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const markedDates = Object.keys(dailyStats).reduce((acc: any, date) => {
        const { income, expense } = dailyStats[date];
        acc[date] = {
            marked: true,
            dots: [
                income > 0 ? { key: 'income', color: '#22C55E' } : null,
                expense > 0 ? { key: 'expense', color: '#EF4444' } : null,
            ].filter(Boolean),
        };
        return acc;
    }, {});

    if (selectedDate) {
        markedDates[selectedDate] = {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#429690',
        };
    }

    const renderTransaction = ({ item }: { item: any }) => {
        const category = getCategoryById(item.category);
        const isExpense = item.type === 'expense';

        return (
            <TouchableOpacity
                style={styles.transactionItem}
                onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: item.id } } as any)}
            >
                <View style={styles.transactionLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: isExpense ? '#FEE2E2' : '#DCFCE7' }]}>
                        <IconSymbol name={category.icon} size={24} color={isExpense ? '#EF4444' : '#22C55E'} />
                    </View>
                    <View>
                        <Text style={styles.transactionTitle}>{item.title}</Text>
                        <View style={styles.transactionMetaRow}>
                            <Text style={styles.transactionDate}>
                                {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </Text>
                            <View style={styles.dotSeparator} />
                            <Text style={styles.transactionDate}>
                                {new Date(item.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.transactionAmount, { color: isExpense ? '#EF4444' : '#22C55E' }]}>
                    {isExpense ? '-' : '+'} ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.header}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Transaction History</Text>
                    <TouchableOpacity style={styles.filterBtn}>
                        <IconSymbol name="ellipsis" size={24} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.calendarContainer}>
                {showMonthYearGrid ? (
                    <View style={styles.gridContainer}>
                        {gridMode === 'year' ? (
                            <View>
                                <View style={styles.gridHeader}>
                                    <Text style={styles.gridHeaderText}>Select Year (2000 - {today.getFullYear()})</Text>
                                </View>
                                <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                                    <View style={[styles.gridItemsRow, { paddingBottom: 10 }]}>
                                        {Array.from({ length: today.getFullYear() - 2000 + 1 }, (_, i) => 2000 + i).reverse().map(year => (
                                            <TouchableOpacity
                                                key={year}
                                                style={[styles.monthGridItem, selectedDate.startsWith(year.toString()) && styles.monthGridItemActive, { width: '23%' }]}
                                                onPress={() => {
                                                    const [y, m, d] = selectedDate.split('-');
                                                    let newYear = year.toString();
                                                    let newMonth = m;
                                                    // Ensure no future month in current year
                                                    if (year === today.getFullYear() && parseInt(m) > (today.getMonth() + 1)) {
                                                        newMonth = String(today.getMonth() + 1).padStart(2, '0');
                                                    }
                                                    setSelectedDate(`${newYear}-${newMonth}-${d}`);
                                                    setGridMode('month');
                                                }}
                                            >
                                                <Text style={[styles.monthGridText, selectedDate.startsWith(year.toString()) && styles.monthGridTextActive]}>{year}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        ) : (
                            <View>
                                <View style={styles.gridYearRow}>
                                    <TouchableOpacity onPress={() => {
                                        const [y, m, d] = selectedDate.split('-');
                                        setSelectedDate(`${parseInt(y) - 1}-${m}-${d}`);
                                    }}>
                                        <IconSymbol name="chevron.left" size={24} color="#429690" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setGridMode('year')}>
                                        <Text style={styles.gridYearText}>{selectedDate.split('-')[0]} (Change)</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const [y, m, d] = selectedDate.split('-');
                                            if (parseInt(y) < today.getFullYear()) {
                                                setSelectedDate(`${parseInt(y) + 1}-${m}-${d}`);
                                            }
                                        }}
                                        disabled={parseInt(selectedDate.split('-')[0]) >= today.getFullYear()}
                                        style={{ opacity: parseInt(selectedDate.split('-')[0]) >= today.getFullYear() ? 0.3 : 1 }}
                                    >
                                        <IconSymbol name="chevron.right" size={24} color="#429690" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.monthGrid}>
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
                                        const monthVal = String(idx + 1).padStart(2, '0');
                                        const isSelected = selectedDate.split('-')[1] === monthVal;
                                        const isFutureMonth = parseInt(selectedDate.split('-')[0]) === today.getFullYear() && idx > today.getMonth();
                                        return (
                                            <TouchableOpacity
                                                key={m}
                                                disabled={isFutureMonth}
                                                style={[
                                                    styles.monthGridItem,
                                                    isSelected && styles.monthGridItemActive,
                                                    isFutureMonth && { opacity: 0.2 }
                                                ]}
                                                onPress={() => {
                                                    const [y, _, d] = selectedDate.split('-');
                                                    setSelectedDate(`${y}-${monthVal}-${d}`);
                                                    setShowMonthYearGrid(false);
                                                }}
                                            >
                                                <Text style={[styles.monthGridText, isSelected && styles.monthGridTextActive]}>{m}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.closeGridBtn}
                            onPress={() => {
                                if (gridMode === 'year') setGridMode('month');
                                else setShowMonthYearGrid(false);
                            }}
                        >
                            <Text style={styles.closeGridBtnText}>{gridMode === 'year' ? 'Back to Months' : 'Back to Calendar'}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Calendar
                        key={selectedDate.substring(0, 7)}
                        current={selectedDate}
                        maxDate={today.toISOString().split('T')[0]}
                        renderHeader={() => (
                            <TouchableOpacity
                                style={styles.calendarHeaderContainer}
                                onPress={() => setShowMonthYearGrid(true)}
                            >
                                <Text style={styles.calendarHeaderText}>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(selectedDate.split('-')[1]) - 1]} {selectedDate.split('-')[0]}
                                </Text>
                                <IconSymbol name="chevron.right" size={14} color="#429690" style={{ transform: [{ rotate: '90deg' }], marginLeft: 5 }} />
                            </TouchableOpacity>
                        )}
                        onDayPress={day => setSelectedDate(day.dateString)}
                        onPressArrowLeft={(subtractMonth: any) => {
                            subtractMonth();
                            const [y, m, d] = selectedDate.split('-');
                            const date = new Date(parseInt(y), parseInt(m) - 2, parseInt(d));
                            setSelectedDate(date.toISOString().split('T')[0]);
                        }}
                        onPressArrowRight={(addMonth: any) => {
                            const [y, m, d] = selectedDate.split('-');
                            const nextMonth = new Date(parseInt(y), parseInt(m), parseInt(d));
                            if (nextMonth <= today || (nextMonth.getMonth() <= today.getMonth() && nextMonth.getFullYear() === today.getFullYear())) {
                                addMonth();
                                setSelectedDate(nextMonth.toISOString().split('T')[0]);
                            }
                        }}
                        markedDates={markedDates}
                        markingType={'multi-dot'}
                        theme={{
                            selectedDayBackgroundColor: '#429690',
                            todayTextColor: '#429690',
                            arrowColor: '#429690',
                            monthTextColor: '#2E7E78',
                            textMonthFontWeight: '700',
                        }}
                    />
                )}

                {selectedDate && dailyStats[selectedDate] && (
                    <View style={styles.selectedDayStats}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Income</Text>
                            <Text style={[styles.statValue, { color: '#22C55E' }]}>+₹{dailyStats[selectedDate].income.toLocaleString()}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Expense</Text>
                            <Text style={[styles.statValue, { color: '#EF4444' }]}>-₹{dailyStats[selectedDate].expense.toLocaleString()}</Text>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>All Transactions</Text>
            </View>

            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onEndReached={() => fetchTransactions()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => (
                    loadingMore ? <ActivityIndicator size="small" color="#429690" style={{ marginVertical: 20 }} /> : null
                )}
                ListEmptyComponent={() => (
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No transactions found</Text>
                        </View>
                    ) : <ActivityIndicator size="large" color="#429690" style={{ marginTop: 50 }} />
                )}
                refreshing={loading}
                onRefresh={() => fetchTransactions(true)}
            />
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
    filterBtn: {
        padding: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    calendarContainer: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    selectedDayStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginTop: 10,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    listHeader: {
        paddingHorizontal: 25,
        marginTop: 20,
        marginBottom: 10,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 18,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    transactionDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
    selectorScroll: {
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    selectorBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: '#F5F5F5',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    selectorBadgeActive: {
        backgroundColor: '#429690',
        borderColor: '#429690',
    },
    selectorBadgeText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    selectorBadgeTextActive: {
        color: 'white',
    },
    monthYearHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F6F5',
        paddingVertical: 12,
        borderRadius: 15,
        marginBottom: 15,
        gap: 8,
    },
    monthYearHeaderText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2E7E78',
    },
    gridContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    gridYearRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    gridYearText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    monthGridItem: {
        width: '30%',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        marginBottom: 5,
    },
    monthGridItemActive: {
        backgroundColor: '#429690',
    },
    monthGridText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    monthGridTextActive: {
        color: 'white',
    },
    calendarHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },
    calendarHeaderText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2E7E78',
    },
    closeGridBtn: {
        marginTop: 20,
        backgroundColor: '#F0F6F5',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeGridBtnText: {
        color: '#429690',
        fontWeight: '700',
        fontSize: 14,
    },
    transactionMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    dotSeparator: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#CCC',
        marginHorizontal: 8,
    },
    gridHeader: {
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        marginBottom: 15,
        alignItems: 'center',
    },
    gridHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    gridItemsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
});
