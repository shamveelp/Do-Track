import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

export default function StatisticsScreen() {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState('Day');

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
                    <LineChart
                        data={{
                            labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                            datasets: [
                                {
                                    data: [15, 25, 20, 38, 20, 28],
                                },
                            ],
                        }}
                        width={width - 20}
                        height={200}
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(66, 150, 144, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '0', // Hide all dots initially
                            },
                            fillShadowGradient: '#429690',
                            fillShadowGradientOpacity: 0.1,
                            propsForLabels: {
                                fontSize: 12,
                            },
                        }}
                        bezier
                        withDots={false}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLines={false}
                        withHorizontalLabels={false}
                        style={styles.chart}
                    />

                    {/* Tooltip Overlay */}
                    <View style={styles.tooltipRoot}>
                        <View style={[styles.dotLine, { left: width * 0.41 }]}>
                            <View style={styles.tooltipBox}>
                                <Text style={styles.tooltipText}>₹ 1,230</Text>
                                <View style={styles.tooltipArrow} />
                            </View>
                            <View style={styles.chartDotInner} />
                            <View style={styles.chartDotOuter} />
                            <View style={styles.dashedLine} />
                        </View>
                    </View>
                </View>

                {/* Top Spending Section */}
                <View style={styles.spendingHeader}>
                    <Text style={styles.spendingTitle}>Top Spending</Text>
                    <TouchableOpacity>
                        <IconSymbol name="arrow.up.arrow.down" size={20} color="#AAA" />
                    </TouchableOpacity>
                </View>

                <View style={styles.spendingList}>
                    {TOP_SPENDING.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.spendingItem, item.selected && styles.spendingItemActive]}
                        >
                            <View style={styles.spendingLeft}>
                                <View style={[styles.imageBox, item.selected && styles.imageBoxActive]}>
                                    {item.avatar ? (
                                        <Image source={item.avatar} style={styles.spendingImage} />
                                    ) : (
                                        <Image source={{ uri: item.icon }} style={styles.spendingIcon} />
                                    )}
                                </View>
                                <View>
                                    <Text style={[styles.spendingName, item.selected && styles.textWhite]}>{item.name}</Text>
                                    <Text style={[styles.spendingDate, item.selected && styles.textLight]}>{item.date}</Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.spendingAmount,
                                item.selected ? styles.textWhite : { color: '#F27480' }
                            ]}>
                                {item.amount}
                            </Text>
                        </TouchableOpacity>
                    ))}
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
        paddingHorizontal: 10,
        height: 260,
    },
    chart: {
        paddingRight: 0,
        paddingLeft: 0,
    },
    tooltipRoot: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    dotLine: {
        position: 'absolute',
        alignItems: 'center',
        top: 70, // Matches where May sits on the chart
    },
    tooltipBox: {
        backgroundColor: '#E6F4F3',
        borderWidth: 1,
        borderColor: '#42969040',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    tooltipText: {
        color: '#429690',
        fontWeight: '700',
        fontSize: 14,
    },
    tooltipArrow: {
        position: 'absolute',
        bottom: -6,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderStyle: 'solid',
        backgroundColor: 'transparent',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#E6F4F3',
    },
    chartDotOuter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(66, 150, 144, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 52,
    },
    chartDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#429690',
        zIndex: 2,
        position: 'absolute',
        top: 56,
    },
    dashedLine: {
        width: 1,
        height: 80,
        borderWidth: 1,
        borderColor: '#CCC',
        borderStyle: 'dashed',
        position: 'absolute',
        top: 60,
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
    textWhite: {
        color: 'white',
    },
    textLight: {
        color: 'rgba(255,255,255,0.7)',
    },
});
