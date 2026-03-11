import { IconSymbol } from '@/components/ui/icon-symbol';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
  { id: '1', title: 'Invite Friends', icon: 'diamond', color: '#EEF8F7', iconColor: '#429690' },
  { id: '2', title: 'Account info', icon: 'person', color: '#F6F6F6', iconColor: '#777' },
  { id: '3', title: 'Personal profile', icon: 'people', color: '#F6F6F6', iconColor: '#777' },
  { id: '4', title: 'Message center', icon: 'envelope', color: '#F6F6F6', iconColor: '#777' },
  { id: '5', title: 'Login and security', icon: 'shield', color: '#F6F6F6', iconColor: '#777' },
  { id: '6', title: 'Data and privacy', icon: 'lock', color: '#F6F6F6', iconColor: '#777' },
];

export default function ProfileScreen() {
  const router = useRouter();

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
              <TouchableOpacity style={styles.bellBtn}>
                <View style={styles.blueBox}>
                  <IconSymbol name="bell" size={22} color="white" />
                  <View style={styles.orangeDot} />
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* The White Curve */}
        <View style={styles.curveWrapper}>
          <View style={styles.whiteCurve} />
        </View>

        {/* Profile Stats / Avatar Overlap */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarOutline}>
            <Image
              source={{ uri: 'file:///C:/Users/Lenovo/.gemini/antigravity/brain/a597d2f5-17f5-4aa0-8aa9-55966d4a1fcb/user_avatar_1773203800541.png' }}
              style={styles.avatarImage}
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.nameSection}>
          <Text style={styles.userName}>Enjelin Morgeana</Text>
          <Text style={styles.userHandle}>@enjelin_morgeana</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity style={styles.menuRow}>
                <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                  <IconSymbol name={item.icon} size={24} color={item.iconColor} />
                </View>
                <Text style={styles.menuLabel}>{item.title}</Text>
              </TouchableOpacity>
              {index === 0 && <View style={styles.menuSeparator} />}
            </React.Fragment>
          ))}
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
    height: 280,
    backgroundColor: 'white',
  },
  headerGradient: {
    height: 240,
    width: '100%',
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
  curveWrapper: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    height: 100,
    overflow: 'hidden',
  },
  whiteCurve: {
    position: 'absolute',
    bottom: -150,
    left: -width / 2,
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    backgroundColor: 'white',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarOutline: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'white',
    padding: 5,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  userName: {
    fontSize: 22,
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
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 17,
    color: '#333',
    fontWeight: '600',
    marginLeft: 18,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
    marginLeft: 70,
  },
});
