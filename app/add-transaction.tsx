import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
    { id: '1', name: 'Netflix', icon: 'https://img.icons8.com/color/48/netflix.png' },
    { id: '2', name: 'Spotify', icon: 'https://img.icons8.com/color/48/spotify.png' },
    { id: '3', name: 'Amazon', icon: 'https://img.icons8.com/color/48/amazon.png' },
    { id: '4', name: 'Uber', icon: 'https://img.icons8.com/color/48/uber.png' },
];

export default function AddTransactionScreen() {
    const router = useRouter();
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [name, setName] = useState('Netflix');
    const [amount, setAmount] = useState('48.00');
    const [date, setDate] = useState(new Date(2022, 1, 22)); // Feb 22, 2022
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        };
        return date.toLocaleDateString('en-GB', options);
    };

    const onDateSelect = (day: any) => {
        const newDate = new Date(day.timestamp);
        setDate(newDate);
        setShowDatePicker(false);
    };

    const dateString = date.toISOString().split('T')[0];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Header */}
            <LinearGradient
                colors={['#429690', '#2E7E78']}
                style={styles.headerBackground}
            >
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <IconSymbol name="chevron.left" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add {type === 'expense' ? 'Expense' : 'Income'}</Text>
                        <TouchableOpacity style={styles.moreBtn}>
                            <IconSymbol name="ellipsis" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.contentContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Main Form Card */}
                    <View style={styles.card}>
                        {/* Type Toggle */}
                        <View style={styles.typeToggleContainer}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
                                onPress={() => setType('expense')}
                            >
                                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>Expense</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'income' && styles.typeBtnActive]}
                                onPress={() => setType('income')}
                            >
                                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>Income</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Name Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>NAME</Text>
                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => setShowCategoryMenu(!showCategoryMenu)}
                            >
                                <View style={styles.dropdownLeft}>
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/color/48/netflix.png' }}
                                        style={styles.categoryIcon}
                                    />
                                    <Text style={styles.dropdownText}>{name}</Text>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color="#AAA" style={{ transform: [{ rotate: '90deg' }] }} />
                            </TouchableOpacity>
                        </View>

                        {/* Amount Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>AMOUNT</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.currencyPrefix}>₹</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity onPress={() => setAmount('')}>
                                    <Text style={styles.clearText}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Date Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>DATE</Text>
                            <TouchableOpacity
                                style={styles.dateInputContainer}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateText}>{formatDate(date)}</Text>
                                <IconSymbol name="calendar" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Invoice Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>INVOICE</Text>
                            <TouchableOpacity style={styles.dottedInvoiceBox}>
                                <View style={styles.addInvoiceRow}>
                                    <View style={styles.plusCircle}>
                                        <IconSymbol name="plus" size={16} color="#666" />
                                    </View>
                                    <Text style={styles.addInvoiceText}>Add Invoice</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.primaryButtonText}>Save Transaction</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                isVisible={showDatePicker}
                onBackdropPress={() => setShowDatePicker(false)}
                onBackButtonPress={() => setShowDatePicker(false)}
                style={styles.modal}
                backdropOpacity={0.5}
                animationIn="slideInUp"
                animationOut="slideOutDown"
            >
                <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Date</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <IconSymbol name="plus" size={24} color="#666" style={{ transform: [{ rotate: '45deg' }] }} />
                        </TouchableOpacity>
                    </View>
                    <Calendar
                        current={dateString}
                        onDayPress={onDateSelect}
                        markedDates={{
                            [dateString]: { selected: true, selectedColor: '#429690' }
                        }}
                        theme={{
                            todayTextColor: '#429690',
                            arrowColor: '#429690',
                            monthTextColor: '#2E7E78',
                            textMonthFontWeight: '700',
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            selectedDayBackgroundColor: '#429690',
                            selectedDayTextColor: '#ffffff',
                        }}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerBackground: {
        height: 180,
        width: '100%',
    },
    headerContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
    },
    backBtn: {
        padding: 8,
    },
    moreBtn: {
        padding: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    contentContainer: {
        flex: 1,
        marginTop: -50,
    },
    scrollContent: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 30,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    typeToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        padding: 5,
        marginBottom: 25,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    typeBtnActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    typeBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    typeBtnTextActive: {
        color: '#2E7E78',
    },
    fieldGroup: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#AAA',
        marginBottom: 10,
        letterSpacing: 1,
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    dropdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    categoryIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#429690',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    currencyPrefix: {
        fontSize: 18,
        fontWeight: '700',
        color: '#429690',
        marginRight: 10,
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#429690',
    },
    clearText: {
        fontSize: 14,
        color: '#429690',
        opacity: 0.7,
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    dottedInvoiceBox: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderStyle: 'dashed',
        borderRadius: 15,
        paddingVertical: 20,
        alignItems: 'center',
    },
    addInvoiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    plusCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#BBB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addInvoiceText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#429690',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#429690',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
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
        padding: 20,
        paddingBottom: 40,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 5,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
});
