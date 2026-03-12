import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/auth-context';
import { Image } from 'expo-image';
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




const MENU_ITEMS = [
  { id: '1', title: 'Invite Friends', icon: 'diamond', color: '#EEF8F7', iconColor: '#429690', route: '/profile/invite' },
  { id: '2', title: 'Account info', icon: 'person', color: '#F6F6F6', iconColor: '#777', route: '/profile/account-info' },
  { id: '3', title: 'Personal profile', icon: 'people', color: '#F6F6F6', iconColor: '#777', route: '/profile/edit-profile' },
  { id: '4', title: 'Message center', icon: 'envelope', color: '#F6F6F6', iconColor: '#777', route: '/notifications' },
  { id: '5', title: 'Login and security', icon: 'shield', color: '#F6F6F6', iconColor: '#777', route: '/profile/security' },
  { id: '6', title: 'Data and privacy', icon: 'lock', color: '#F6F6F6', iconColor: '#777', route: '/profile/privacy' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const userEmail = user?.email || 'User';
  const userHandle = user?.email ? `@${user.email.split('@')[0]}` : '@user';
  const avatarUrl = user?.user_metadata?.avatar_url || 'https://res.cloudinary.com/drmroxs00/image/upload/v1741709497/user_avatar_placeholder.png';
  const userDisplayName = user?.user_metadata?.full_name || userEmail;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Container */}
      <View style={styles.headerStack}>
        <LinearGradient
          colors={['#429690', '#2E7E78']}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.navBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <IconSymbol name="chevron.left" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Profile</Text>
              <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')}>
                <View style={styles.blueBox}>
                  <IconSymbol name="bell" size={22} color="white" />
                  <View style={styles.orangeDot} />
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Profile Stats / Avatar Overlap */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarOutline}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={500}
              cachePolicy="disk"
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.nameSection}>
          <Text style={styles.userName}>{userDisplayName}</Text>
          <Text style={styles.userHandle}>{userHandle}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                  <IconSymbol name={item.icon as any} size={24} color={item.iconColor} />
                </View>
                <Text style={styles.menuLabel}>{item.title}</Text>
                <View style={{ flex: 1 }} />
                <IconSymbol name="chevron.right" size={20} color="#CCC" />
              </TouchableOpacity>
              {index === 0 && <View style={styles.menuSeparator} />}
            </React.Fragment>
          ))}

          <TouchableOpacity style={[styles.menuRow, { marginTop: 10 }]} onPress={signOut}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFEEF0' }]}>
              <IconSymbol name="eye.slash" size={24} color="#F27480" />
            </View>
            <Text style={[styles.menuLabel, { color: '#F27480' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerStack: {
    height: 320, // Taller overall stack
    backgroundColor: 'white',
  },
  headerGradient: {
    height: 250, // Lower green section
    width: '100%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  iconBtn: {
    padding: 5,
  },
  navTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  bellBtn: {
    padding: 2,
  },
  blueBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orangeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8A00',
    borderWidth: 1,
    borderColor: '#429690',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: 0, // Align with the bottom of headerStack
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarOutline: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    padding: 6,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    top: -70, // Overlap half-way (Total height 140, top -70)
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100,
    marginTop: -40, // Pull content up
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 30,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  userHandle: {
    fontSize: 15,
    color: '#439A94',
    fontWeight: '600',
    marginTop: 4,
  },
  menuList: {
    paddingHorizontal: 25,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 15,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 10,
    marginLeft: 65,
  },
});
