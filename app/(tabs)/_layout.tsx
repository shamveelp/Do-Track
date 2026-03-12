import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs, useRouter } from 'expo-router'; // Added useRouter
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const CustomFabButton = ({ children, onPress }: any) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.fabContainer}
      onPress={() => router.push('/add-transaction')}
      activeOpacity={0.7}
    >
      <View style={styles.fabInner}>
        <IconSymbol name="plus" size={32} color="white" />
      </View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E7E78',
        tabBarInactiveTintColor: '#AAAAAA',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fab"
        options={{
          tabBarButton: (props) => (
            <CustomFabButton {...props} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="wallet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: 80,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  fabContainer: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#429690',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#429690',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
});
