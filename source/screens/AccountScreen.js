import React, { useCallback, useContext } from 'react';
import { SafeAreaView, View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../contexts/AuthContext';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';

export default function AccountScreen() {
  const { user, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  //Check role LANDLORD từ user trong Context
  const isLandlord = useMemo(() => {
    const names = (user?.userRoles ?? []).map(
      ur => (ur?.role?.name ?? '').toUpperCase()
    );
    return names.includes('LANDLORD');
  }, [user?.userRoles]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          },
        },
      ],
      { cancelable: true }
    );
  }, [logout, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 90 + insets.top }]}>
        <TouchableOpacity style={styles.notifyBtn}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Nội dung trắng */}
      <View style={styles.content}>
        {/* Avatar giữa ranh giới */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://placehold.co/160x160/png' }}
            style={styles.avatar}
          />
        </View>

        {/* Tên + email */}
        <View style={styles.profileBox}>
          <Text style={styles.name}>
            {(user?.firstname || '') + ' ' + (user?.lastname || '')}
          </Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* Menu */}
        <View style={styles.card}>
          <MenuItem icon="id-card-outline" label="Thông tin tài khoản" />
          <Separator />
          <MenuItem icon="person-circle-outline" label="Trang cá nhân" onPress={() => navigation.navigate('Profile', { profileUser: user })} />
        </View>

        {/* Chỉ hiện khi CHƯA là LANDLORD */}
        {!isLandlord && (
          <View style={styles.card}>
            <MenuItem
              icon="home-outline"
              label="Gửi yêu cầu làm chủ trọ"
              onPress={() => navigation.navigate('LandlordRequest', { userId: user?.id })}
            />
          </View>
        )}

        {isLandlord && (
          <View style={styles.card}>
            <MenuItem
              icon="home-outline"
              label="Quản lý trọ"
              onPress={() => navigation.navigate('BoardingZoneManager')}
            />
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBar} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={18} color="#ff6b6b" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.9} onPress={onPress}>
    <View style={styles.left}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color="#666" />
      </View>
      <Text style={styles.rowText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#b8b8b8" />
  </TouchableOpacity>
);

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#1976D2',
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifyBtn: { position: 'absolute', right: 20 },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 60, // chừa chỗ cho avatar
    paddingHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileBox: { alignItems: 'center', marginBottom: 20, marginTop: 0 },
  name: { fontSize: 18, fontWeight: '600', color: '#222' },
  email: { fontSize: 13, color: '#666' },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eceff3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { fontSize: 16, color: '#222' },
  separator: { height: 1, backgroundColor: '#e7e9ee', marginHorizontal: 14 },
  logoutBar: {
    backgroundColor: '#fff0f0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: { color: '#ff6b6b', fontSize: 16, fontWeight: '600' },
});
