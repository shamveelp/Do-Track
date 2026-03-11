import { IconSymbol } from '@/components/ui/icon-symbol';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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

export default function AddTransactionScreen() {
    const router = useRouter();
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
    const [date, setDate] = useState(new Date());
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        // Clear category if type changes
        setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    }, [type]);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('title')
                .limit(50);

            if (data) {
                const uniqueTitles = Array.from(new Set(data.map(t => t.title)));
                setSuggestions(uniqueTitles);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSave = async () => {
        if (!title || !amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid title and amount');
            return;
        }

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    title,
                    amount: parseFloat(amount),
                    type,
                    category: category.id,
                    date: date.toISOString(),
                    note
                });

            if (error) throw error;

            Alert.alert('Success', 'Transaction saved successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const dateString = date.toISOString().split('T')[0];
    const categoriesToShow = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient colors={['#429690', '#2E7E78']} style={styles.headerBackground}>
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <IconSymbol name="chevron.left" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add {type === 'expense' ? 'Expense' : 'Income'}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.contentContainer}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

                        {/* Name/Title Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>NAME / TITLE</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter what it's for..."
                                value={title}
                                onChangeText={setTitle}
                            />
                            {suggestions.length > 0 && !title && (
                                <View style={styles.suggestionsContainer}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {suggestions.map((s, i) => (
                                            <TouchableOpacity key={i} onPress={() => setTitle(s)} style={styles.suggestionBadge}>
                                                <Text style={styles.suggestionText}>{s}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
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
                                    placeholder="0.00"
                                />
                            </View>
                        </View>

                        {/* Category Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>CATEGORY</Text>
                            <TouchableOpacity
                                style={styles.dropdownInput}
                                onPress={() => setShowCategoryPicker(true)}
                            >
                                <View style={styles.dropdownLeft}>
                                    <View style={[styles.miniIconContainer, { backgroundColor: type === 'expense' ? '#FEE2E2' : '#DCFCE7' }]}>
                                        <IconSymbol name={category.icon} size={18} color={type === 'expense' ? '#EF4444' : '#22C55E'} />
                                    </View>
                                    <Text style={styles.dropdownText}>{category.name}</Text>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color="#AAA" style={{ transform: [{ rotate: '90deg' }] }} />
                            </TouchableOpacity>
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

                        {/* Note Field */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Add a note..."
                                value={note}
                                onChangeText={setNote}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Save Transaction</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Date Picker Modal */}
            <Modal
                isVisible={showDatePicker}
                onBackdropPress={() => setShowDatePicker(false)}
                style={styles.modal}
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
                        onDayPress={(day: any) => {
                            setDate(new Date(day.timestamp));
                            setShowDatePicker(false);
                        }}
                        markedDates={{ [dateString]: { selected: true, selectedColor: '#429690' } }}
                        theme={{
                            todayTextColor: '#429690',
                            arrowColor: '#429690',
                            selectedDayBackgroundColor: '#429690',
                        }}
                    />
                </View>
            </Modal>

            {/* Category Picker Modal */}
            <Modal
                isVisible={showCategoryPicker}
                onBackdropPress={() => setShowCategoryPicker(false)}
                style={styles.modal}
            >
                <View style={[styles.pickerContainer, { maxHeight: '70%' }]}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Category</Text>
                        <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                            <IconSymbol name="plus" size={24} color="#666" style={{ transform: [{ rotate: '45deg' }] }} />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={categoriesToShow}
                        keyExtractor={item => item.id}
                        numColumns={3}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.categorySelectItem}
                                onPress={() => {
                                    setCategory(item);
                                    setShowCategoryPicker(false);
                                }}
                            >
                                <View style={[styles.categorySelectIcon, { backgroundColor: type === 'expense' ? '#FEE2E2' : '#DCFCE7' }]}>
                                    <IconSymbol name={item.icon} size={24} color={type === 'expense' ? '#EF4444' : '#22C55E'} />
                                </View>
                                <Text style={styles.categorySelectName}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    headerBackground: { height: 160, width: '100%' },
    headerContent: { flex: 1, paddingHorizontal: 20 },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    backBtn: { padding: 8 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
    contentContainer: { flex: 1, marginTop: -50 },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
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
    typeToggleContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 15, padding: 5, marginBottom: 25 },
    typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    typeBtnActive: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    typeBtnText: { fontSize: 14, fontWeight: '600', color: '#888' },
    typeBtnTextActive: { color: '#2E7E78' },
    fieldGroup: { marginBottom: 20 },
    fieldLabel: { fontSize: 12, fontWeight: '600', color: '#AAA', marginBottom: 10, letterSpacing: 1 },
    textInput: { borderWidth: 1, borderColor: '#EEE', borderRadius: 15, padding: 15, fontSize: 16, color: '#333' },
    textArea: { borderWidth: 1, borderColor: '#EEE', borderRadius: 15, padding: 15, fontSize: 16, color: '#333', textAlignVertical: 'top', height: 100 },
    dropdownInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12 },
    dropdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    miniIconContainer: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    dropdownText: { fontSize: 16, color: '#333', fontWeight: '500' },
    amountInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#429690', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12 },
    currencyPrefix: { fontSize: 18, fontWeight: '700', color: '#429690', marginRight: 10 },
    amountInput: { flex: 1, fontSize: 18, fontWeight: '700', color: '#429690' },
    dateInputContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 15 },
    dateText: { fontSize: 16, color: '#333' },
    primaryButton: { backgroundColor: '#429690', paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginTop: 10, shadowColor: '#429690', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
    modal: { margin: 0, justifyContent: 'flex-end' },
    pickerContainer: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingBottom: 40 },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pickerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    suggestionsContainer: { marginTop: 10 },
    suggestionBadge: { backgroundColor: '#F0F6F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
    suggestionText: { color: '#429690', fontSize: 12, fontWeight: '500' },
    categorySelectItem: { flex: 1, alignItems: 'center', marginBottom: 20, padding: 10 },
    categorySelectIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    categorySelectName: { fontSize: 12, color: '#666', textAlign: 'center' }
});

