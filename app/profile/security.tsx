import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SecurityScreen() {
    const router = useRouter();
    const [faceId, setFaceId] = useState(true);
    const [twoStep, setTwoStep] = useState(false);

    const handlePasswordReset = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email);
            if (error) Alert.alert('Error', error.message);
            else Alert.alert('Check Email', 'Password reset instructions sent to ' + user.email);
        }
    };

    const SecurityItem = ({ title, desc, value, onValueChange, icon }: any) => (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                    <IconSymbol name={icon} size={22} color="#429690" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemDesc}>{desc}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#DDD', true: '#429690' }}
            />
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
                    <Text style={styles.headerTitle}>Login and Security</Text>
                    <View style={{ width: 40 }} />
                </SafeAreaView>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authentication</Text>
                    <SecurityItem
                        title="Biometric Login"
                        desc="Use FaceID or Fingerprint"
                        value={faceId}
                        onValueChange={setFaceId}
                        icon="shield"
                    />
                    <SecurityItem
                        title="2-Factor Auth"
                        desc="Extra security for logins"
                        value={twoStep}
                        onValueChange={setTwoStep}
                        icon="lock"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Password</Text>
                    <TouchableOpacity style={styles.actionBtn} onPress={handlePasswordReset}>
                        <View style={styles.iconBox}>
                            <IconSymbol name="key" size={22} color="#429690" />
                        </View>
                        <Text style={styles.actionBtnText}>Reset Password via Email</Text>
                        <IconSymbol name="chevron.right" size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Devices</Text>
                    <TouchableOpacity style={styles.actionBtn}>
                        <View style={styles.iconBox}>
                            <IconSymbol name="smartphone" size={22} color="#429690" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.actionBtnText}>Active Devices</Text>
                            <Text style={styles.itemDesc}>Manage authorized devices</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
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
    content: {
        padding: 25,
        marginTop: -30,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#999',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F6F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    itemDesc: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
    },
    actionBtnText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
});
