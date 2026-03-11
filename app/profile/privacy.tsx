import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
    const router = useRouter();

    const PolicySection = ({ title, content }: any) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.content}>{content}</Text>
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
                    <Text style={styles.headerTitle}>Data and Privacy</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <PolicySection
                    title="1. Data Collection"
                    content="We collect transaction data, categories, and account information solely to provide you with financial insights. Your data is encrypted and stored securely using Supabase infrastructure."
                />
                <PolicySection
                    title="2. Third Party Sharing"
                    content="Do-Track does not sell or share your personal financial data with third-party advertisers. We only use essential services (like Supabase and Google Auth) required for the app to function."
                />
                <PolicySection
                    title="3. Your Rights"
                    content="You have the right to export your data or delete your account at any time. All stored data will be permanently removed from our servers upon account deletion."
                />
                <PolicySection
                    title="4. Security Measures"
                    content="We use industry-standard SSL encryption for all data transfers. Your authentication is handled securely via OAuth and JWT tokens."
                />

                <TouchableOpacity style={styles.exportBtn}>
                    <IconSymbol name="square.and.arrow.up" size={20} color="white" />
                    <Text style={styles.exportText}>Export My Data (JSON)</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
    scrollContainer: {
        padding: 25,
        marginTop: -30,
    },
    section: {
        backgroundColor: '#F8F8F8',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#333',
        marginBottom: 10,
    },
    content: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    exportBtn: {
        backgroundColor: '#429690',
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    exportText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
