import { IconSymbol } from '@/components/ui/icon-symbol';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
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
    const { editId } = useLocalSearchParams();
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
    const [showMonthYearGrid, setShowMonthYearGrid] = useState(false);
    const [gridMode, setGridMode] = useState<'month' | 'year'>('month');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const today = new Date();

    const fetchTransactionToEdit = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', editId)
                .single();

            if (error) throw error;
            if (data) {
                setType(data.type);
                setTitle(data.title);
                setAmount(data.amount.toString());
                setDate(new Date(data.date));
                setNote(data.note || '');
                const cat = (data.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)
                    .find(c => c.id === data.category);
                if (cat) setCategory(cat);
            }
        } catch (error) {
            console.error('Error fetching for edit:', error);
            Alert.alert('Error', 'Failed to load transaction data');
        } finally {
            setLoading(false);
        }
    }, [editId]);

    const fetchSuggestions = useCallback(async () => {
        try {
            const { data } = await supabase
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
    }, []);

    useEffect(() => {
        // Clear category if type changes, but ONLY if not in edit mode
        if (!editId) {
            setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
        }
    }, [type, editId]);

    useEffect(() => {
        if (editId) {
            fetchTransactionToEdit();
        }
        fetchSuggestions();
    }, [editId, fetchTransactionToEdit, fetchSuggestions]);

    const handleSave = async () => {
        if (!title || !amount || parseFloat(amount) <= 0) {
            Alert.alert('Error', 'Please enter a valid title and amount');
            return;
        }

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            if (editId) {
                const { error } = await supabase
                    .from('transactions')
                    .update({
                        title,
                        amount: parseFloat(amount),
                        type,
                        category: category.id,
                        date: date.toISOString(),
                        note
                    })
                    .eq('id', editId);
                if (error) throw error;
            } else {
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
            }

            Alert.alert('Success', `Transaction ${editId ? 'updated' : 'saved'} successfully`, [
                {
                    text: 'OK',
                    onPress: () => {
                        if (editId) {
                            router.replace({ pathname: '/transaction/[id]', params: { id: editId } } as any);
                        } else {
                            router.back();
                        }
                    }
                }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
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
                        <Text style={styles.headerTitle}>{editId ? 'Edit' : 'Add'} {type === 'expense' ? 'Expense' : 'Income'}</Text>
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

                        {/* Date & Time Row */}
                        <View style={styles.dateTimeRow}>
                            <View style={[styles.fieldGroup, { flex: 1.5, marginRight: 10 }]}>
                                <Text style={styles.fieldLabel}>DATE</Text>
                                <TouchableOpacity
                                    style={styles.dateInputContainer}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.dateText}>{date.toLocaleDateString('en-GB')}</Text>
                                    <IconSymbol name="calendar" size={18} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.fieldGroup, { flex: 1 }]}>
                                <Text style={styles.fieldLabel}>TIME</Text>
                                <TouchableOpacity
                                    style={styles.dateInputContainer}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={styles.dateText}>
                                        {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
                onBackdropPress={() => {
                    setShowDatePicker(false);
                    setShowMonthYearGrid(false);
                    setGridMode('month');
                }}
                style={styles.modal}
            >
                <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select {gridMode === 'year' ? 'Year' : 'Date'}</Text>
                        <TouchableOpacity onPress={() => {
                            setShowDatePicker(false);
                            setShowMonthYearGrid(false);
                            setGridMode('month');
                        }}>
                            <IconSymbol name="plus" size={24} color="#666" style={{ transform: [{ rotate: '45deg' }] }} />
                        </TouchableOpacity>
                    </View>

                    {showMonthYearGrid ? (
                        <View style={styles.gridContainer}>
                            {gridMode === 'year' ? (
                                <View>
                                    <View style={styles.gridHeader}>
                                        <Text style={styles.gridHeaderText}>Select Year (2000 - {today.getFullYear()})</Text>
                                    </View>
                                    <ScrollView style={{ maxHeight: 300 }}>
                                        <View style={styles.yearGrid}>
                                            {Array.from({ length: today.getFullYear() - 2000 + 1 }, (_, i) => 2000 + i).reverse().map(year => (
                                                <TouchableOpacity
                                                    key={year}
                                                    style={[styles.monthGridItem, date.getFullYear() === year && styles.monthGridItemActive]}
                                                    onPress={() => {
                                                        const newDate = new Date(date);
                                                        newDate.setFullYear(year);
                                                        // Ensure if we pick current year, month isn't future
                                                        if (year === today.getFullYear() && newDate.getMonth() > today.getMonth()) {
                                                            newDate.setMonth(today.getMonth());
                                                        }
                                                        setDate(newDate);
                                                        setGridMode('month');
                                                    }}
                                                >
                                                    <Text style={[styles.monthGridText, date.getFullYear() === year && styles.monthGridTextActive]}>{year}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            ) : (
                                <View>
                                    <View style={styles.gridYearRow}>
                                        <TouchableOpacity onPress={() => {
                                            const newDate = new Date(date);
                                            newDate.setFullYear(date.getFullYear() - 1);
                                            setDate(newDate);
                                        }}>
                                            <IconSymbol name="chevron.left" size={24} color="#429690" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setGridMode('year')}>
                                            <Text style={styles.gridYearText}>{date.getFullYear()} (Tap to change)</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const newDate = new Date(date);
                                                if (date.getFullYear() < today.getFullYear()) {
                                                    newDate.setFullYear(date.getFullYear() + 1);
                                                    setDate(newDate);
                                                }
                                            }}
                                            disabled={date.getFullYear() >= today.getFullYear()}
                                            style={{ opacity: date.getFullYear() >= today.getFullYear() ? 0.3 : 1 }}
                                        >
                                            <IconSymbol name="chevron.right" size={24} color="#429690" />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.monthGrid}>
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => {
                                            const isFutureMonth = date.getFullYear() === today.getFullYear() && idx > today.getMonth();
                                            return (
                                                <TouchableOpacity
                                                    key={m}
                                                    disabled={isFutureMonth}
                                                    style={[
                                                        styles.monthGridItem,
                                                        date.getMonth() === idx && styles.monthGridItemActive,
                                                        isFutureMonth && { opacity: 0.2 }
                                                    ]}
                                                    onPress={() => {
                                                        const newDate = new Date(date);
                                                        newDate.setMonth(idx);
                                                        setDate(newDate);
                                                        setShowMonthYearGrid(false);
                                                    }}
                                                >
                                                    <Text style={[styles.monthGridText, date.getMonth() === idx && styles.monthGridTextActive]}>{m}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.closeGridBtn}
                                onPress={() => {
                                    if (gridMode === 'year') {
                                        setGridMode('month');
                                    } else {
                                        setShowMonthYearGrid(false);
                                    }
                                }}
                            >
                                <Text style={styles.closeGridBtnText}>{gridMode === 'year' ? 'Back to Months' : 'Back to Calendar'}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Calendar
                            key={`${date.getFullYear()}-${date.getMonth()}`}
                            current={dateString}
                            maxDate={today.toISOString().split('T')[0]}
                            renderHeader={() => (
                                <TouchableOpacity
                                    style={styles.calendarHeaderContainer}
                                    onPress={() => setShowMonthYearGrid(true)}
                                >
                                    <Text style={styles.calendarHeaderText}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()]} {date.getFullYear()}
                                    </Text>
                                    <IconSymbol name="chevron.right" size={14} color="#429690" style={{ transform: [{ rotate: '90deg' }], marginLeft: 5 }} />
                                </TouchableOpacity>
                            )}
                            onDayPress={(day: any) => {
                                // Preserving hours and minutes
                                const newDate = new Date(day.timestamp);
                                newDate.setHours(date.getHours());
                                newDate.setMinutes(date.getMinutes());
                                setDate(newDate);
                                setShowDatePicker(false);
                            }}
                            onPressArrowLeft={(subtractMonth: any) => {
                                subtractMonth();
                                const d = new Date(date);
                                d.setMonth(d.getMonth() - 1);
                                setDate(d);
                            }}
                            onPressArrowRight={(addMonth: any) => {
                                // Check if next month is in the future
                                const nextMonth = new Date(date);
                                nextMonth.setMonth(date.getMonth() + 1);
                                if (nextMonth <= today || nextMonth.getMonth() <= today.getMonth() && nextMonth.getFullYear() === today.getFullYear()) {
                                    addMonth();
                                    setDate(nextMonth);
                                }
                            }}
                            markedDates={{ [dateString]: { selected: true, selectedColor: '#429690' } }}
                            theme={{
                                todayTextColor: '#429690',
                                arrowColor: '#429690',
                                selectedDayBackgroundColor: '#429690',
                                textMonthFontWeight: '700',
                            }}
                        />
                    )}
                </View>
            </Modal>

            {/* Time Picker Modal */}
            <Modal
                isVisible={showTimePicker}
                onBackdropPress={() => setShowTimePicker(false)}
                style={styles.modal}
            >
                <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>Select Time</Text>
                        <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                            <IconSymbol name="plus" size={24} color="#666" style={{ transform: [{ rotate: '45deg' }] }} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timePickerContainer}>
                        <View style={styles.timeColumn}>
                            <TouchableOpacity onPress={() => {
                                const d = new Date(date);
                                d.setHours((d.getHours() + 1) % 24);
                                setDate(d);
                            }}>
                                <IconSymbol name="chevron.right" size={30} color="#429690" style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>{(date.getHours() % 12 || 12).toString().padStart(2, '0')}</Text>
                            <TouchableOpacity onPress={() => {
                                const d = new Date(date);
                                d.setHours((d.getHours() - 1 + 24) % 24);
                                setDate(d);
                            }}>
                                <IconSymbol name="chevron.right" size={30} color="#429690" style={{ transform: [{ rotate: '90deg' }] }} />
                            </TouchableOpacity>
                            <Text style={styles.timeLabel}>Hours</Text>
                        </View>

                        <Text style={styles.timeSeparator}>:</Text>

                        <View style={styles.timeColumn}>
                            <TouchableOpacity onPress={() => {
                                const d = new Date(date);
                                d.setMinutes((d.getMinutes() + 1) % 60);
                                setDate(d);
                            }}>
                                <IconSymbol name="chevron.right" size={30} color="#429690" style={{ transform: [{ rotate: '-90deg' }] }} />
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>{date.getMinutes().toString().padStart(2, '0')}</Text>
                            <TouchableOpacity onPress={() => {
                                const d = new Date(date);
                                d.setMinutes((d.getMinutes() - 1 + 60) % 60);
                                setDate(d);
                            }}>
                                <IconSymbol name="chevron.right" size={30} color="#429690" style={{ transform: [{ rotate: '90deg' }] }} />
                            </TouchableOpacity>
                            <Text style={styles.timeLabel}>Minutes</Text>
                        </View>

                        <View style={styles.ampmColumn}>
                            <TouchableOpacity
                                style={[styles.ampmBtn, date.getHours() < 12 && styles.ampmBtnActive]}
                                onPress={() => {
                                    if (date.getHours() >= 12) {
                                        const d = new Date(date);
                                        d.setHours(d.getHours() - 12);
                                        setDate(d);
                                    }
                                }}
                            >
                                <Text style={[styles.ampmBtnText, date.getHours() < 12 && styles.ampmBtnTextActive]}>AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.ampmBtn, date.getHours() >= 12 && styles.ampmBtnActive]}
                                onPress={() => {
                                    if (date.getHours() < 12) {
                                        const d = new Date(date);
                                        d.setHours(d.getHours() + 12);
                                        setDate(d);
                                    }
                                }}
                            >
                                <Text style={[styles.ampmBtnText, date.getHours() >= 12 && styles.ampmBtnTextActive]}>PM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => setShowTimePicker(false)}
                    >
                        <Text style={styles.primaryButtonText}>Set Time</Text>
                    </TouchableOpacity>
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
    categorySelectName: { fontSize: 12, color: '#666', textAlign: 'center' },
    selectorScroll: { marginBottom: 15 },
    selectorBadge: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    selectorBadgeActive: {
        backgroundColor: '#429690',
        borderColor: '#429690',
    },
    selectorBadgeText: {
        fontSize: 13,
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
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    yearGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    timePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
        gap: 10,
    },
    timeColumn: {
        alignItems: 'center',
        width: 70,
    },
    timeValue: {
        fontSize: 48,
        fontWeight: '800',
        color: '#333',
        marginVertical: 10,
    },
    timeSeparator: {
        fontSize: 40,
        fontWeight: '800',
        color: '#AAA',
        marginTop: -10,
    },
    timeLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#999',
        marginTop: 5,
        textTransform: 'uppercase',
    },
    ampmColumn: {
        marginLeft: 10,
        gap: 10,
    },
    ampmBtn: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEE',
        alignItems: 'center',
    },
    ampmBtnActive: {
        backgroundColor: '#429690',
        borderColor: '#429690',
    },
    ampmBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#666',
    },
    ampmBtnTextActive: {
        color: 'white',
    },
});

