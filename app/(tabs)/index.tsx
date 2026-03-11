import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const YEARS = ['All Transactions', '2026', '2025', '2024'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });

  // Filter States
  const [filterType, setFilterType] = useState('year'); // default 2026
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showMonthYearGrid, setShowMonthYearGrid] = useState(false);
  const [gridMode, setGridMode] = useState<'month' | 'year'>('month');

  const today = new Date();

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [selectedYear, selectedMonth, customRange, filterType])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserData(user);

      let query = supabase.from('transactions').select('*');

      // Apply Filters
      if (filterType === 'year' && selectedYear !== 'All Transactions') {
        const start = `${selectedYear}-01-01T00:00:00`;
        const end = `${selectedYear}-12-31T23:59:59`;
        query = query.gte('date', start).lte('date', end);
      } else if (filterType === 'month' && selectedMonth !== null) {
        const year = selectedYear === 'All Transactions' ? '2026' : selectedYear;
        const start = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-01T00:00:00`;
        const lastDay = new Date(parseInt(year), selectedMonth + 1, 0).getDate();
        const end = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-${lastDay}T23:59:59`;
        query = query.gte('date', start).lte('date', end);
      } else if (filterType === 'custom' && customRange && customRange.from) {
        query = query.gte('date', `${customRange.from}T00:00:00`);
        if (customRange.to) {
          query = query.lte('date', `${customRange.to}T23:59:59`);
        }
      }

      // Fetch recent for list - fetch 100 to be safe, then filter
      const { data: trans, error: transError } = await supabase.from('transactions').select('*')
        .order('date', { ascending: false })
        .limit(100);

      if (transError) throw transError;

      const fortyEightHoursAgo = new Date();
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

      // Rule: Last 15 OR all in last 2 days (48h), whichever is more
      const filteredTrans = (trans || []).filter((t, idx) => {
        const tDate = new Date(t.date);
        return idx < 15 || tDate >= fortyEightHoursAgo;
      });

      setTransactions(filteredTrans);

      // Calculate stats for current filter
      const { data: allTrans, error: allTransError } = await query.select('amount, type');

      if (allTransError) throw allTransError;

      let income = 0;
      let expense = 0;
      allTrans?.forEach(t => {
        const amt = parseFloat(t.amount);
        if (t.type === 'income') income += amt;
        else expense += amt;
      });

      setStats({
        balance: income - expense,
        income,
        expense
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatCurrency = (val: number) => {
    return '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const getFilterLabel = () => {
    if (filterType === 'year') return selectedYear;
    if (filterType === 'month' && selectedMonth !== null) return `${MONTHS[selectedMonth]} ${selectedYear}`;
    if (filterType === 'custom' && customRange) return `${customRange.from} - ${customRange.to}`;
    return 'All Transactions';
  };

  const userDisplayName = userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'User';
  const avatarUrl = userData?.user_metadata?.avatar_url || 'https://res.cloudinary.com/drmroxs00/image/upload/v1741709497/user_avatar_placeholder.png';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={['#429690', '#2E7E78']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Abstract circles */}
          <View style={[styles.headerCircle, { top: -50, right: -50, width: 200, height: 200, opacity: 0.1 }]} />
          <View style={[styles.headerCircle, { top: 20, left: -30, width: 100, height: 100, opacity: 0.05 }]} />
          <View style={[styles.headerCircle, { bottom: 50, right: 30, width: 60, height: 60, opacity: 0.08 }]} />

          <SafeAreaView edges={['top']} style={styles.headerContent}>
            <View style={styles.topRow}>
              <TouchableOpacity
                style={styles.userInfoRow}
                onPress={() => router.push('/profile')}
              >
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.profilePicSmall}
                  cachePolicy="disk"
                  transition={500}
                />
                <View>
                  <Text style={styles.greetingText}>Good afternoon,</Text>
                  <Text style={styles.userNameText}>{userDisplayName}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => router.push('/notifications')}
              >
                <IconSymbol name="bell" size={24} color="white" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Balance Card Section */}
        <View style={styles.cardContainer}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View style={styles.totalBalanceRow}>
                <Text style={styles.cardLabel}>Total Balance</Text>
                <IconSymbol name="chevron.right" size={16} color="white" style={{ transform: [{ rotate: '-90deg' }] }} />
              </View>
              <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterTrigger}>
                <Text style={styles.filterText}>{getFilterLabel()}</Text>
                <IconSymbol name="chevron.down" size={18} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(stats.balance)}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="arrow.down" size={16} color="white" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={styles.statValue}>{formatCurrency(stats.income)}</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="arrow.up" size={16} color="white" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={styles.statValue}>{formatCurrency(stats.expense)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions History</Text>
          <TouchableOpacity onPress={() => router.push('/transactions-history')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {loading ? (
            <ActivityIndicator size="small" color="#429690" />
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyText}>No recent transactions</Text>
          ) : (
            transactions.map((item, index) => {
              const category = getCategoryById(item.category);
              const isExpense = item.type === 'expense';
              const itemDate = new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

              // Show date barrier
              const showDateHeader = index === 0 ||
                new Date(transactions[index - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) !== itemDate;

              return (
                <View key={item.id}>
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
                        <Text style={styles.transactionName}>{item.title}</Text>
                        <Text style={styles.transactionTime}>
                          {new Date(item.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: isExpense ? '#EF4444' : '#22C55E' }
                    ]}>
                      {isExpense ? '-' : '+'} ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Padding for bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        isVisible={showFilterModal}
        onBackdropPress={() => setShowFilterModal(false)}
        style={styles.modal}
        backdropOpacity={0.5}
      >
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Filter Transactions</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <IconSymbol name="plus" size={24} color="#666" style={{ transform: [{ rotate: '45deg' }] }} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Year Selection */}
            <Text style={styles.filterGroupLabel}>Select Year</Text>
            <View style={styles.filterOptions}>
              {YEARS.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.optionBadge, selectedYear === year && filterType === 'year' && styles.optionBadgeActive]}
                  onPress={() => {
                    setSelectedYear(year);
                    setFilterType('year');
                    setSelectedMonth(null);
                    setCustomRange(null);
                  }}
                >
                  <Text style={[styles.optionText, selectedYear === year && filterType === 'year' && styles.optionTextActive]}>{year}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Month Selection */}
            <Text style={styles.filterGroupLabel}>Select Month ({selectedYear === 'All Transactions' ? '2026' : selectedYear})</Text>
            <View style={styles.filterOptions}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[styles.optionBadge, selectedMonth === index && filterType === 'month' && styles.optionBadgeActive]}
                  onPress={() => {
                    setSelectedMonth(index);
                    setFilterType('month');
                    if (selectedYear === 'All Transactions') setSelectedYear('2026');
                    setCustomRange(null);
                  }}
                >
                  <Text style={[styles.optionText, selectedMonth === index && filterType === 'month' && styles.optionTextActive]}>{month}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Range */}
            <Text style={styles.filterGroupLabel}>Custom Date Range</Text>
            <View style={styles.datePickerContainer}>
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
                              style={[styles.monthGridItem, (customRange?.from || new Date().toISOString()).startsWith(year.toString()) && styles.monthGridItemActive, { width: '23%' }]}
                              onPress={() => {
                                const dateStr = customRange?.from || new Date().toISOString();
                                const [_, m, d] = dateStr.split('-');
                                let newMonth = m;
                                if (year === today.getFullYear() && parseInt(m) > (today.getMonth() + 1)) {
                                  newMonth = String(today.getMonth() + 1).padStart(2, '0');
                                }
                                setCustomRange({ from: `${year}-${newMonth}-${d}`, to: '' });
                                setGridMode('month');
                              }}
                            >
                              <Text style={[styles.monthGridText, (customRange?.from || new Date().toISOString()).startsWith(year.toString()) && styles.monthGridTextActive]}>{year}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.gridYearRow}>
                        <TouchableOpacity onPress={() => {
                          const dateStr = customRange?.from || new Date().toISOString();
                          const [y, m, d] = dateStr.split('-');
                          setCustomRange({ from: `${parseInt(y) - 1}-${m}-${d}`, to: '' });
                        }}>
                          <IconSymbol name="chevron.left" size={24} color="#429690" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setGridMode('year')}>
                          <Text style={styles.gridYearText}>{(customRange?.from || new Date().toISOString()).split('-')[0]} (Change)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            const dateStr = customRange?.from || new Date().toISOString();
                            const [y, m, d] = dateStr.split('-');
                            if (parseInt(y) < today.getFullYear()) {
                              setCustomRange({ from: `${parseInt(y) + 1}-${m}-${d}`, to: '' });
                            }
                          }}
                          disabled={parseInt((customRange?.from || new Date().toISOString()).split('-')[0]) >= today.getFullYear()}
                          style={{ opacity: parseInt((customRange?.from || new Date().toISOString()).split('-')[0]) >= today.getFullYear() ? 0.3 : 1 }}
                        >
                          <IconSymbol name="chevron.right" size={24} color="#429690" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.monthGrid}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
                          const monthVal = String(idx + 1).padStart(2, '0');
                          const dateStr = customRange?.from || new Date().toISOString();
                          const currentYear = dateStr.split('-')[0];
                          const currentMonth = dateStr.split('-')[1];
                          const isSelected = currentMonth === monthVal;
                          const isFutureMonth = parseInt(currentYear) === today.getFullYear() && idx > today.getMonth();
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
                                const [y, _, d] = dateStr.split('-');
                                setCustomRange({ from: `${y}-${monthVal}-${d}`, to: '' });
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
                  key={(customRange?.from || new Date().toISOString()).substring(0, 7)}
                  current={customRange?.from || new Date().toISOString()}
                  maxDate={today.toISOString().split('T')[0]}
                  renderHeader={() => (
                    <TouchableOpacity
                      style={styles.calendarHeaderContainer}
                      onPress={() => setShowMonthYearGrid(true)}
                    >
                      <Text style={styles.calendarHeaderText}>
                        {MONTHS[parseInt((customRange?.from || new Date().toISOString()).split('-')[1]) - 1]} {(customRange?.from || new Date().toISOString()).split('-')[0]}
                      </Text>
                      <IconSymbol name="chevron.right" size={14} color="#429690" style={{ transform: [{ rotate: '90deg' }], marginLeft: 5 }} />
                    </TouchableOpacity>
                  )}
                  markingType={'period'}
                  onDayPress={(day: any) => {
                    if (!customRange || (customRange.from && customRange.to)) {
                      setCustomRange({ from: day.dateString, to: '' });
                    } else {
                      const range = { from: customRange.from, to: day.dateString };
                      if (new Date(range.from) > new Date(range.to)) {
                        setCustomRange({ from: range.to, to: range.from });
                      } else {
                        setCustomRange(range);
                      }
                      setFilterType('custom');
                    }
                  }}
                  onPressArrowLeft={(subtractMonth: any) => {
                    subtractMonth();
                    const dateStr = customRange?.from || new Date().toISOString();
                    const [y, m, d] = dateStr.split('-');
                    const date = new Date(parseInt(y), parseInt(m) - 2, 1);
                    setCustomRange({ from: date.toISOString().split('T')[0], to: '' });
                  }}
                  onPressArrowRight={(addMonth: any) => {
                    const dateStr = customRange?.from || new Date().toISOString();
                    const [y, m, d] = dateStr.split('-');
                    const nextMonth = new Date(parseInt(y), parseInt(m), 1);
                    if (nextMonth <= today || (nextMonth.getMonth() <= today.getMonth() && nextMonth.getFullYear() === today.getFullYear())) {
                      addMonth();
                      setCustomRange({ from: nextMonth.toISOString().split('T')[0], to: '' });
                    }
                  }}
                  markedDates={
                    customRange?.from ? {
                      [customRange.from]: { startingDay: true, color: '#429690', textColor: 'white' },
                      ...(customRange.to ? { [customRange.to]: { endingDay: true, color: '#429690', textColor: 'white' } } : {})
                    } : {}
                  }
                  theme={{
                    todayTextColor: '#429690',
                    arrowColor: '#429690',
                    selectedDayBackgroundColor: '#429690',
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyBtnText}>Apply Filter</Text>
            </TouchableOpacity>
          </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  headerCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'white',
  },
  header: {
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  greetingText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '400',
  },
  userNameText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  notificationBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePicSmall: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    backgroundColor: '#F7A072',
    borderRadius: 3,
  },
  cardContainer: {
    marginTop: -100,
    paddingHorizontal: 25,
  },
  balanceCard: {
    backgroundColor: '#2E7E78',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#2F7E79',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: '#D0D0D0',
    fontSize: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  seeAll: {
    color: '#666',
    fontSize: 14,
  },
  transactionsList: {
    paddingHorizontal: 25,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#F0F6F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateHeader: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginTop: 15,
  },
  dateHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  transactionTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 14,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '90%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  filterGroupLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  optionBadgeActive: {
    backgroundColor: '#429690',
    borderColor: '#429690',
  },
  optionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  optionTextActive: {
    color: 'white',
  },
  datePickerContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 15,
    overflow: 'hidden',
  },
  applyBtn: {
    backgroundColor: '#429690',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginVertical: 25,
    shadowColor: '#429690',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  applyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  selectorScroll: {
    marginBottom: 5,
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
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    gap: 8,
    marginHorizontal: 10,
  },
  monthYearHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7E78',
  },
  gridContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  gridYearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  gridYearText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthGridItem: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 5,
  },
  monthGridItemActive: {
    backgroundColor: '#429690',
  },
  monthGridText: {
    fontSize: 13,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#2E7E78',
  },
  closeGridBtn: {
    marginTop: 15,
    backgroundColor: '#F0F6F5',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  closeGridBtnText: {
    color: '#429690',
    fontWeight: '700',
    fontSize: 13,
  },
  transactionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CCC',
    marginHorizontal: 8,
  },
  gridHeader: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 12,
    alignItems: 'center',
  },
  gridHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  gridItemsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
});

