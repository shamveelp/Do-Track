import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCategoryById } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TOP_SPENDING = [
    {
        id: '1',
        name: 'Starbucks',
        date: 'Jan 12, 2022',
        amount: '- ₹ 150.00',
        icon: 'https://img.icons8.com/color/48/starbucks.png',
        selected: false,
    },
    {
        id: '2',
        name: 'Transfer',
        date: 'Yesterday',
        amount: '- ₹ 85.00',
        avatar: require('@/assets/images/friend1.png'),
        selected: true,
    },
    {
        id: '3',
        name: 'Youtube',
        date: 'Jan 16, 2022',
        amount: '- ₹ 11.99',
        icon: 'https://img.icons8.com/color/48/youtube-play.png',
        selected: false,
    },
];

const PERIOD_TABS = ['Day', 'Week', 'Month', 'Year'];

const CATEGORY_COLORS: Record<string, string> = {
    food: '#FF6B6B',
    shopping: '#4ECDC4',
    transportation: '#45B7D1',
    entertainment: '#96CEB4',
    education: '#FFEEAD',
    health: '#D4A5A5',
    housing: '#9B59B6',
    others: '#34495E',
    salary: '#22C55E',
    electronics: '#3498DB'
};

const getCategoryColor = (cid: string) => CATEGORY_COLORS[cid] || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

export default function StatisticsScreen() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState('Month');
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [lineData, setLineData] = useState<any>({ labels: [], datasets: [{ data: [] }] });
    const [pieData, setPieData] = useState<any[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);

    useFocusEffect(
        useCallback(() => {
            fetchStatsData();
        }, [selectedTab])
    );

    const fetchStatsData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let startDate = new Date();
            const now = new Date();

            if (selectedTab === 'Day') {
                startDate.setHours(0, 0, 0, 0);
            } else if (selectedTab === 'Week') {
                startDate.setDate(now.getDate() - 7);
            } else if (selectedTab === 'Month') {
                startDate.setMonth(now.getMonth() - 1);
            } else if (selectedTab === 'Year') {
                startDate.setFullYear(now.getFullYear() - 1);
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .gte('date', startDate.toISOString())
                .order('date', { ascending: true });

            if (error) throw error;
            setTransactions(data || []);

            // Process Line Chart Data
            const labels: string[] = [];
            const amounts: number[] = [];

            // Group for trend
            const groups: Record<string, number> = {};
            data?.forEach(t => {
                if (t.type === 'expense') {
                    const d = new Date(t.date);
                    let key = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    if (selectedTab === 'Year') key = d.toLocaleDateString('en-GB', { month: 'short' });
                    groups[key] = (groups[key] || 0) + parseFloat(t.amount);
                }
            });

            Object.entries(groups).slice(-6).forEach(([label, amt]) => {
                labels.push(label);
                amounts.push(amt);
            });

            if (amounts.length === 0) {
                setLineData({ labels: ['No Data'], datasets: [{ data: [0] }] });
            } else {
                setLineData({ labels, datasets: [{ data: amounts }] });
            }

            // Process Pie Chart Data
            const catGroups: Record<string, number> = {};
            let total = 0;
            data?.forEach(t => {
                if (t.type === 'expense') {
                    catGroups[t.category] = (catGroups[t.category] || 0) + parseFloat(t.amount);
                    total += parseFloat(t.amount);
                }
            });

            const processedPie = Object.entries(catGroups).map(([cid, amt]) => {
                const cat = getCategoryById(cid);
                return {
                    name: cat.name,
                    amount: amt,
                    color: getCategoryColor(cid),
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12
                };
            }).sort((a, b) => b.amount - a.amount);

            setPieData(processedPie);
            setTotalSpent(total);

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                        <IconSymbol name="chevron.left" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Statistics</Text>
                    <TouchableOpacity style={styles.iconBtn}>
                        <IconSymbol name="square.and.arrow.up" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Period Selector Tabs */}
                <View style={styles.tabsContainer}>
                    {PERIOD_TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, selectedTab === tab && styles.activeTab]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Dropdown Selector */}
                <View style={styles.dropdownWrapper}>
                    <TouchableOpacity style={styles.dropdownBtn}>
                        <Text style={styles.dropdownText}>Expense</Text>
                        <IconSymbol name="chevron.down" size={18} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Chart Section */}
                <View style={styles.chartContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#429690" style={{ marginTop: 50 }} />
                    ) : (
                        <LineChart
                            data={lineData}
                            width={width - 40}
                            height={200}
                            chartConfig={{
                                backgroundColor: '#fff',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(66, 150, 144, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: '4', strokeWidth: '2', stroke: '#429690' },
                                fillShadowGradient: '#429690',
                                fillShadowGradientOpacity: 0.1,
                            }}
                            bezier
                            withInnerLines={false}
                            style={styles.chart}
                        />
                    )}
                </View>

                {/* Donut Chart Section */}
                <View style={styles.donutSection}>
                    <Text style={styles.sectionTitle}>Expense Structure</Text>
                    <View style={styles.donutContainer}>
                        <PieChart
                            data={pieData}
                            width={width - 50}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor={"amount"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            center={[10, 0]}
                            absolute
                            hasLegend={true}
                        />
                        <View style={styles.donutHole}>
                            <Text style={styles.donutTotalLabel}>Total Spent</Text>
                            <Text style={styles.donutTotalValue}>₹{totalSpent.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Top Spending Section */}
                <View style={styles.spendingHeader}>
                    <Text style={styles.spendingTitle}>Top Spending</Text>
                    <TouchableOpacity onPress={fetchStatsData}>
                        <IconSymbol name="arrow.clockwise" size={20} color="#429690" />
                    </TouchableOpacity>
                </View>

                <View style={styles.spendingList}>
                    {transactions
                        .filter(t => t.type === 'expense')
                        .sort((a, b) => b.amount - a.amount)
                        .slice(0, 5)
                        .map((item) => {
                            const category = getCategoryById(item.category);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.spendingItem}
                                    onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: item.id } } as any)}
                                >
                                    <View style={styles.spendingLeft}>
                                        <View style={[styles.imageBox, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                                            <IconSymbol name={category.icon} size={24} color={getCategoryColor(item.category)} />
                                        </View>
                                        <View>
                                            <Text style={styles.spendingName}>{item.title}</Text>
                                            <Text style={styles.spendingDate}>
                                                {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.spendingAmount, { color: '#EF4444' }]}>
                                        - ₹{parseFloat(item.amount).toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    {transactions.filter(t => t.type === 'expense').length === 0 && (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <Text style={{ color: '#999' }}>No expenses found in this period</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        backgroundColor: 'white',
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    iconBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#429690',
    },
    tabText: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    activeTabText: {
        color: 'white',
        fontWeight: '600',
    },
    dropdownWrapper: {
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    dropdownText: {
        color: '#666',
        fontWeight: '500',
    },
    chartContainer: {
        marginTop: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    chart: {
        borderRadius: 20,
        paddingRight: 40, // Space for labels
    },
    spendingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginTop: 30,
        marginBottom: 15,
    },
    spendingTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    spendingList: {
        paddingHorizontal: 25,
    },
    spendingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FCFCFC',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
    },
    spendingItemActive: {
        backgroundColor: '#429690',
        shadowColor: '#429690',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    spendingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    imageBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imageBoxActive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    spendingIcon: {
        width: 24,
        height: 24,
    },
    spendingImage: {
        width: '100%',
        height: '100%',
    },
    spendingName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    spendingDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    spendingAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    donutSection: {
        marginTop: 30,
        paddingHorizontal: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    donutContainer: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    donutHole: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        left: '20.5%', // Perfectly centered on the PieChart circle
        borderWidth: 6,
        borderColor: '#F8F8F8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    donutTotalLabel: {
        fontSize: 10,
        color: '#999',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    donutTotalValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#333',
    },
});
