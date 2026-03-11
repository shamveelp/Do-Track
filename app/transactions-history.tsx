import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
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

    // Filter States
    const [filterType, setFilterType] = useState<'all' | 'day' | 'month' | 'year' | 'custom'>('all');
    const [selectedYearFilter, setSelectedYearFilter] = useState('2026');
    const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | null>(null);
    const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [periodTotals, setPeriodTotals] = useState({ income: 0, expense: 0, balance: 0 });
    const [showCalendar, setShowCalendar] = useState(false); // Collapsible calendar

    const today = new Date();

    useFocusEffect(
        useCallback(() => {
            fetchTransactions(true);
            fetchMonthlyStats();
            fetchPeriodTotals();
        }, [filterType, selectedYearFilter, selectedMonthFilter, customRange, selectedDate])
    );

    const fetchTransactions = async (refresh = false) => {
        if ((loading && !refresh) || loadingMore || (!hasMore && !refresh)) return;

        if (refresh) setLoading(true);
        else setLoadingMore(true);

        try {
            const start = refresh ? 0 : page * PAGE_SIZE;
            const end = start + PAGE_SIZE - 1;

            let query = supabase.from('transactions').select('*');

            // Apply Filters based on filterType
            if (filterType === 'day') {
                const start = `${selectedDate}T00:00:00`;
                const end = `${selectedDate}T23:59:59`;
                query = query.gte('date', start).lte('date', end);
            } else if (filterType === 'year' && selectedYearFilter !== 'All') {
                const start = `${selectedYearFilter}-01-01T00:00:00`;
                const end = `${selectedYearFilter}-12-31T23:59:59`;
                query = query.gte('date', start).lte('date', end);
            } else if (filterType === 'month' && selectedMonthFilter !== null) {
                const year = selectedYearFilter === 'All' ? '2026' : selectedYearFilter;
                const start = `${year}-${String(selectedMonthFilter + 1).padStart(2, '0')}-01T00:00:00`;
                const lastDay = new Date(parseInt(year), selectedMonthFilter + 1, 0).getDate();
                const end = `${year}-${String(selectedMonthFilter + 1).padStart(2, '0')}-${lastDay}T23:59:59`;
                query = query.gte('date', start).lte('date', end);
            } else if (filterType === 'custom' && customRange && customRange.from) {
                query = query.gte('date', `${customRange.from}T00:00:00`);
                if (customRange.to) {
                    query = query.lte('date', `${customRange.to}T23:59:59`);
                }
            }

            const { data, error } = await query
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

    const fetchPeriodTotals = async () => {
        try {
            let query = supabase.from('transactions').select('amount, type');

            if (filterType === 'day') {
                query = query.gte('date', `${selectedDate}T00:00:00`).lte('date', `${selectedDate}T23:59:59`);
            } else if (filterType === 'year' && selectedYearFilter !== 'All') {
                query = query.gte('date', `${selectedYearFilter}-01-01T00:00:00`).lte('date', `${selectedYearFilter}-12-31T23:59:59`);
            } else if (filterType === 'month' && selectedMonthFilter !== null) {
                const year = selectedYearFilter === 'All' ? '2026' : selectedYearFilter;
                const start = `${year}-${String(selectedMonthFilter + 1).padStart(2, '0')}-01T00:00:00`;
                const lastDay = new Date(parseInt(year), selectedMonthFilter + 1, 0).getDate();
                const end = `${year}-${String(selectedMonthFilter + 1).padStart(2, '0')}-${lastDay}T23:59:59`;
                query = query.gte('date', start).lte('date', end);
            } else if (filterType === 'custom' && customRange && customRange.from) {
                query = query.gte('date', `${customRange.from}T00:00:00`);
                if (customRange.to) query = query.lte('date', `${customRange.to}T23:59:59`);
            }

            const { data, error } = await query;
            if (error) throw error;

            let inc = 0, exp = 0;
            data?.forEach(t => {
                const amt = parseFloat(t.amount);
                if (t.type === 'income') inc += amt;
                else exp += amt;
            });

            setPeriodTotals({ income: inc, expense: exp, balance: inc - exp });
        } catch (error) {
            console.error('Error fetching period totals:', error);
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

    if (selectedDate && filterType === 'day') {
        markedDates[selectedDate] = {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: '#429690',
        };
    }

    const fetchMonthlyStats = async () => {
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
            console.error('Error fetching monthly stats:', error);
        }
    };

    const renderTransaction = ({ item, index }: { item: any, index: number }) => {
        const category = getCategoryById(item.category);
        const isExpense = item.type === 'expense';
        const itemDate = new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        // Show date header if it's the first item or date changed
        const showDateHeader = index === 0 ||
            new Date(transactions[index - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) !== itemDate;

        return (
            <View>
                {showDateHeader && (
                    <View style={styles.dateHeader}>
                        <Text style={styles.dateHeaderText}>{itemDate}</Text>
                    </View>
                )}
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
                            <Text style={styles.transactionTime}>
                                {new Date(item.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.transactionAmount, { color: isExpense ? '#EF4444' : '#22C55E' }]}>
                        {isExpense ? '-' : '+'} ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                    </Text>
                </TouchableOpacity>
            </View>
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
                    <Text style={styles.headerTitle}>Report & History</Text>
                    <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterBtn}>
                        <IconSymbol name="ellipsis" size={24} color="white" />
                    </TouchableOpacity>
                </SafeAreaView>

                <View style={styles.overviewContainer}>
                    <Text style={styles.overviewLabel}>Total Balance</Text>
                    <Text style={styles.overviewValue}>₹ {periodTotals.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
            </LinearGradient>

            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryIcon, { backgroundColor: '#DCFCE7' }]}>
                        <IconSymbol name="plus" size={18} color="#22C55E" />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Total Income</Text>
                        <Text style={[styles.summaryValue, { color: '#22C55E' }]}>+₹ {periodTotals.income.toLocaleString()}</Text>
                    </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                    <View style={[styles.summaryIcon, { backgroundColor: '#FEE2E2' }]}>
                        <IconSymbol name="plus" size={18} color="#EF4444" style={{ transform: [{ rotate: '45deg' }] }} />
                    </View>
                    <View>
                        <Text style={styles.summaryLabel}>Total Expense</Text>
                        <Text style={[styles.summaryValue, { color: '#EF4444' }]}>-₹ {periodTotals.expense.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.filterBar}>
                <View style={styles.activeFilterInfo}>
                    <Text style={styles.activeFilterText}>
                        {filterType === 'all' ? 'All Transactions' :
                            filterType === 'day' ? `Date: ${new Date(selectedDate).toLocaleDateString('en-GB')}` :
                                filterType === 'month' ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedMonthFilter!]} ${selectedYearFilter}` :
                                    filterType === 'year' ? `Year ${selectedYearFilter}` : 'Custom Range'}
                    </Text>
                </View>
                <View style={styles.filterActions}>
                    <TouchableOpacity
                        style={[styles.actionIconBtn, showCalendar && styles.actionIconBtnActive]}
                        onPress={() => setShowCalendar(!showCalendar)}
                    >
                        <IconSymbol name="calendar" size={18} color={showCalendar ? 'white' : '#429690'} />
                    </TouchableOpacity>
                    {filterType !== 'all' && (
                        <TouchableOpacity style={styles.clearBadge} onPress={() => {
                            setFilterType('all');
                            setSelectedMonthFilter(null);
                            setCustomRange(null);
                        }}>
                            <Text style={styles.clearBadgeText}>Reset</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {showCalendar && (
                <View style={styles.collapsibleCalendar}>
                    {showMonthYearGrid ? (
                        <View style={styles.gridContainer}>
                            {gridMode === 'year' ? (
                                <View>
                                    <View style={styles.gridHeader}>
                                        <Text style={styles.gridHeaderText}>Select Year (2000 - {today.getFullYear()})</Text>
                                    </View>
                                    <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                                        <View style={styles.gridItemsRow}>
                                            {Array.from({ length: today.getFullYear() - 2000 + 1 }, (_, i) => 2000 + i).reverse().map(year => (
                                                <TouchableOpacity
                                                    key={year}
                                                    style={[styles.monthGridItem, selectedDate.startsWith(year.toString()) && styles.monthGridItemActive, { width: '23%' }]}
                                                    onPress={() => {
                                                        const [y, m, d] = selectedDate.split('-');
                                                        setSelectedDate(`${year}-${m}-${d}`);
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
                                            <Text style={styles.gridYearText}>{selectedDate.split('-')[0]}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const [y, m, d] = selectedDate.split('-');
                                                if (parseInt(y) < today.getFullYear()) setSelectedDate(`${parseInt(y) + 1}-${m}-${d}`);
                                            }}
                                            disabled={parseInt(selectedDate.split('-')[0]) >= today.getFullYear()}
                                        >
                                            <IconSymbol name="chevron.right" size={24} color="#429690" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.monthGrid}>
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                                            const monthVal = String(idx + 1).padStart(2, '0');
                                            const isSelected = selectedDate.split('-')[1] === monthVal;
                                            return (
                                                <TouchableOpacity
                                                    key={month}
                                                    style={[styles.monthGridItem, isSelected && styles.monthGridItemActive]}
                                                    onPress={() => {
                                                        const [y, _, d] = selectedDate.split('-');
                                                        setSelectedDate(`${y}-${monthVal}-${d}`);
                                                        setShowMonthYearGrid(false);
                                                    }}
                                                >
                                                    <Text style={[styles.monthGridText, isSelected && styles.monthGridTextActive]}>{month}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                            <TouchableOpacity style={styles.closeGridBtn} onPress={() => setShowMonthYearGrid(false)}>
                                <Text style={styles.closeGridBtnText}>Back to Calendar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Calendar
                            current={selectedDate}
                            maxDate={today.toISOString().split('T')[0]}
                            onDayPress={day => {
                                setSelectedDate(day.dateString);
                                setFilterType('day');
                            }}
                            renderHeader={() => (
                                <TouchableOpacity onPress={() => setShowMonthYearGrid(true)}>
                                    <Text style={styles.calendarHeaderText}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(selectedDate.split('-')[1]) - 1]} {selectedDate.split('-')[0]}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            markedDates={markedDates}
                            markingType={'multi-dot'}
                            theme={{ todayTextColor: '#429690', selectedDayBackgroundColor: '#429690', arrowColor: '#429690' }}
                        />
                    )}
                </View>
            )}

            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                onEndReached={() => fetchTransactions()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => loadingMore ? <ActivityIndicator size="small" color="#429690" /> : null}
                ListEmptyComponent={() => !loading ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>No results for this period</Text></View> : <ActivityIndicator size="large" color="#429690" style={{ marginTop: 40 }} />}
                refreshing={loading}
                onRefresh={() => fetchTransactions(true)}
            />

            {/* Filter Modal */}
            <Modal isVisible={showFilterModal} onBackdropPress={() => setShowFilterModal(false)} style={styles.modal}>
                <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Filter Options</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <IconSymbol name="plus" size={24} color="#666" style={{ transform: [{ rotate: '45deg' }] }} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.filterSectionTitle}>Year</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                            {['All', '2026', '2025', '2024'].map(y => (
                                <TouchableOpacity
                                    key={y}
                                    style={[styles.selectorBadge, filterType === (y === 'All' ? 'all' : 'year') && selectedYearFilter === y && styles.selectorBadgeActive]}
                                    onPress={() => {
                                        setFilterType(y === 'All' ? 'all' : 'year');
                                        setSelectedYearFilter(y);
                                        setSelectedMonthFilter(null);
                                    }}
                                >
                                    <Text style={[styles.selectorBadgeText, filterType === (y === 'All' ? 'all' : 'year') && selectedYearFilter === y && styles.selectorBadgeTextActive]}>{y}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.filterSectionTitle}>Month</Text>
                        <View style={styles.monthGrid}>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.monthSelectorItem, filterType === 'month' && selectedMonthFilter === i && styles.monthSelectorItemActive]}
                                    onPress={() => {
                                        setFilterType('month');
                                        setSelectedMonthFilter(i);
                                        if (selectedYearFilter === 'All') setSelectedYearFilter('2026');
                                    }}
                                >
                                    <Text style={[styles.monthSelectorText, filterType === 'month' && selectedMonthFilter === i && styles.monthSelectorTextActive]}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterSectionTitle}>Quick Actions</Text>
                        <View style={styles.infoBox}>
                            <IconSymbol name="plus" size={18} color="#429690" />
                            <Text style={styles.infoBoxText}>Use the calendar icon on main screen to select specific dates</Text>
                        </View>
                    </ScrollView>
                    <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilterModal(false)}>
                        <Text style={styles.applyBtnText}>Show Results</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
        fontSize: 20,
        fontWeight: '800',
    },
    overviewContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    overviewLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    overviewValue: {
        color: 'white',
        fontSize: 28,
        fontWeight: '800',
        marginTop: 2,
    },
    summaryCard: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 25,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    summaryItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 15,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginTop: 25,
        marginBottom: 15,
    },
    activeFilterInfo: {
        flex: 1,
    },
    activeFilterText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    filterActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    actionIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F6F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIconBtnActive: {
        backgroundColor: '#429690',
    },
    clearBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FEE2E2',
        borderRadius: 10,
    },
    clearBadgeText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '700',
    },
    collapsibleCalendar: {
        marginHorizontal: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    dateHeader: {
        paddingHorizontal: 25,
        paddingVertical: 10,
        backgroundColor: '#F8F8F8',
    },
    dateHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    listContent: {
        paddingBottom: 40,
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
    transactionTime: {
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
    listHeaderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    clearText: {
        fontSize: 14,
        color: '#429690',
        fontWeight: '700',
    },
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '80%',
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#333',
    },
    filterSectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#999',
        textTransform: 'uppercase',
        marginTop: 20,
        marginBottom: 12,
        letterSpacing: 1,
    },
    monthSelectorItem: {
        width: '23%',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    monthSelectorItemActive: {
        backgroundColor: '#429690',
        borderColor: '#429690',
    },
    monthSelectorText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    monthSelectorTextActive: {
        color: 'white',
    },
    applyBtn: {
        backgroundColor: '#429690',
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 30,
    },
    applyBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    customRangeBtn: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    customRangeBtnActive: {
        borderColor: '#429690',
        backgroundColor: '#F0F6F5',
    },
    customRangeBtnText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    customRangeBtnTextActive: {
        color: '#429690',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F6F5',
        padding: 15,
        borderRadius: 15,
        gap: 10,
        borderWidth: 1,
        borderColor: '#E0EFEE',
    },
    infoBoxText: {
        fontSize: 14,
        color: '#2E7E78',
        fontWeight: '600',
    },
    modalFooter: {
        paddingTop: 10,
    },
});
