import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const TRANSACTIONS = [
  {
    id: '1',
    name: 'Upwork',
    date: 'Today',
    amount: '+ $ 850.00',
    type: 'income',
    icon: 'https://img.icons8.com/color/48/upwork.png', // Fallback if logo not found
  },
  {
    id: '2',
    name: 'Transfer',
    date: 'Yesterday',
    amount: '- $ 85.00',
    type: 'expense',
    avatar: require('@/assets/images/friend1.png'),
  },
  {
    id: '3',
    name: 'Paypal',
    date: 'Jan 30, 2022',
    amount: '+ $ 1,406.00',
    type: 'income',
    icon: 'https://img.icons8.com/color/48/paypal.png',
  },
  {
    id: '4',
    name: 'Youtube',
    date: 'Jan 16, 2022',
    amount: '- $ 11.99',
    type: 'expense',
    icon: 'https://img.icons8.com/color/48/youtube-play.png',
  },
];

const FRIENDS = [
  { id: '1', avatar: require('@/assets/images/friend1.png') },
  { id: '2', avatar: require('@/assets/images/friend2.png') },
  { id: '3', avatar: require('@/assets/images/friend3.png') },
  { id: '4', avatar: require('@/assets/images/friend1.png') },
  { id: '5', avatar: require('@/assets/images/friend2.png') },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
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
              <View>
                <Text style={styles.greetingText}>Good afternoon,</Text>
                <Text style={styles.userNameText}>Enjelin Morgeana</Text>
              </View>
              <TouchableOpacity style={styles.notificationBtn}>
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
              <IconSymbol name="ellipsis" size={24} color="white" />
            </View>
            <Text style={styles.balanceAmount}>$ 2,548.00</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="arrow.down" size={16} color="white" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={styles.statValue}>$ 1,840.00</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="arrow.up" size={16} color="white" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={styles.statValue}>$ 284.00</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions History</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {TRANSACTIONS.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.iconContainer}>
                  {item.avatar ? (
                    <Image source={item.avatar} style={styles.avatarIcon} />
                  ) : (
                    <Image source={{ uri: item.icon }} style={styles.transactionIcon} />
                  )}
                </View>
                <View>
                  <Text style={styles.transactionName}>{item.name}</Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: item.type === 'income' ? '#25A969' : '#F27480' }
              ]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Send Again */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Send Again</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsList}>
          {FRIENDS.map((friend, index) => (
            <TouchableOpacity key={index} style={styles.friendAvatarContainer}>
              <Image source={friend.avatar} style={styles.friendAvatar} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Padding for bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
    overflow: 'hidden', // Add overflow hidden to clip circles
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
    // Add subtle shadow for transactions
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
  transactionIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  avatarIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  friendsList: {
    paddingLeft: 25,
    paddingRight: 10,
    gap: 12,
  },
  friendAvatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
  },
});
