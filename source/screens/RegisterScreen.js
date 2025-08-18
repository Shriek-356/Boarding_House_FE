import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { registerUser } from '../api/userApi';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    role: 'RENTER', // mặc định, không hiển thị UI chọn
  });

  // Kiểm soát hiển thị lỗi
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const errors = useMemo(() => validate(form), [form]);
  const hasError = Object.values(errors).some(Boolean);

  const onChange = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const markTouched = (key) => setTouched(t => ({ ...t, [key]: true }));

  const handleRegister = async () => {
    // Khi nhấn Đăng ký: hiện lỗi cho tất cả field
    const allTouched = {};
    Object.keys(form).forEach(k => (allTouched[k] = true));
    setTouched(allTouched);

    if (hasError) {
      Toast.show({
        type: 'error',
        text1: 'Thiếu/ Sai thông tin',
        text2: firstErrorMsg(errors),
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', form.username.trim());
      formData.append('password', form.password);
      formData.append('email', form.email.trim());
      formData.append('phone', form.phone.trim());
      formData.append('firstName', form.firstName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('address', form.address.trim());
      formData.append('role', form.role); // RENTER

      await registerUser(formData); // đừng tự set Content-Type

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Tạo tài khoản thành công! Hãy đăng nhập.',
      });
      navigation.navigate('Login');
    } catch (err) {
      const msg =
        (typeof err?.response?.data === 'string' && err.response.data) ||
        err?.response?.data?.message ||
        err?.message ||
        'Đăng ký thất bại, vui lòng thử lại!';
      Toast.show({ type: 'error', text1: 'Lỗi', text2: String(msg) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Tham gia Boarding House để tìm phòng & quản lý đăng tin dễ dàng
          </Text>

          <View style={styles.card}>
            {/* Họ - Tên */}
            <View style={styles.row}>
              <Input
                icon="account-outline"
                label="Họ"
                value={form.lastName}
                onChangeText={(t) => onChange('lastName', t)}
                onFocus={() => markTouched('lastName')}
                placeholder="Nguyễn"
                error={touched.lastName && errors.lastName}
                containerStyle={{ flex: 1, marginRight: 8 }}
                autoCapitalize="words"
              />
              <Input
                icon="account-outline"
                label="Tên"
                value={form.firstName}
                onChangeText={(t) => onChange('firstName', t)}
                onFocus={() => markTouched('firstName')}
                placeholder="An"
                error={touched.firstName && errors.firstName}
                containerStyle={{ flex: 1, marginLeft: 8 }}
                autoCapitalize="words"
              />
            </View>

            <Input
              icon="account-circle-outline"
              label="Tên đăng nhập"
              value={form.username}
              onChangeText={(t) => onChange('username', t)}
              onFocus={() => markTouched('username')}
              placeholder="username"
              error={touched.username && errors.username}
              autoCapitalize="none"
            />

            <Input
              icon="email-outline"
              label="Email"
              value={form.email}
              onChangeText={(t) => onChange('email', t)}
              onFocus={() => markTouched('email')}
              placeholder="email@domain.com"
              error={touched.email && errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              icon="phone-outline"
              label="Số điện thoại"
              value={form.phone}
              onChangeText={(t) => onChange('phone', t)}
              onFocus={() => markTouched('phone')}
              placeholder="0xxxxxxxxx"
              error={touched.phone && errors.phone}
              keyboardType="phone-pad"
            />

            <Input
              icon="map-marker-outline"
              label="Địa chỉ"
              value={form.address}
              onChangeText={(t) => onChange('address', t)}
              onFocus={() => markTouched('address')}
              placeholder="Số nhà, đường, phường, quận, tỉnh"
              error={touched.address && errors.address}
            />

            <Input
              icon="lock-outline"
              label="Mật khẩu"
              value={form.password}
              onChangeText={(t) => onChange('password', t)}
              onFocus={() => markTouched('password')}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              error={touched.password && errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={22} />
                </TouchableOpacity>
              }
              autoCapitalize="none"
            />

            <Input
              icon="lock-check-outline"
              label="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChangeText={(t) => onChange('confirmPassword', t)}
              onFocus={() => markTouched('confirmPassword')}
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              error={touched.confirmPassword && errors.confirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                  <Icon name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} />
                </TouchableOpacity>
              }
              autoCapitalize="none"
            />

            {/* Không có UI chọn role - mặc định RENTER */}

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? <ActivityIndicator /> : <Text style={styles.buttonText}>Đăng ký</Text>}
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginTop: 14 }}>
              <Text>
                Đã có tài khoản?{' '}
                <Text style={styles.link} onPress={() => navigation?.goBack?.()}>
                  Đăng nhập
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Input({ icon, label, error, containerStyle, rightIcon, style, ...props }) {
  const showError = !!error; // chỉ hiện khi field đã touched hoặc sau khi bấm Đăng ký
  return (
    <View style={[{ marginBottom: 12 }, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, showError && styles.inputError]}>
        {!!icon && <Icon name={icon} size={20} style={{ marginRight: 8 }} />}
        <TextInput style={[styles.textInput, style]} {...props} />
        {rightIcon}
      </View>
      {showError && <Text style={styles.helperError}>{error}</Text>}
    </View>
  );
}

function validate(f) {
  const e = {};
  if (!f.lastName?.trim()) e.lastName = 'Vui lòng nhập họ';
  if (!f.firstName?.trim()) e.firstName = 'Vui lòng nhập tên';

  if (!f.username?.trim()) e.username = 'Vui lòng nhập tên đăng nhập';
  else if (f.username.length < 4) e.username = 'Tên đăng nhập tối thiểu 4 ký tự';

  if (!f.email?.trim()) e.email = 'Vui lòng nhập email';
  else if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Email không hợp lệ';

  if (!f.phone?.trim()) e.phone = 'Vui lòng nhập số điện thoại';
  else if (!/^0\d{9,10}$/.test(f.phone)) e.phone = 'Số điện thoại không hợp lệ';

  if (!f.address?.trim()) e.address = 'Vui lòng nhập địa chỉ';

  if (!f.password) e.password = 'Vui lòng nhập mật khẩu';
  else if (f.password.length < 6) e.password = 'Mật khẩu tối thiểu 6 ký tự';

  if (!f.confirmPassword) e.confirmPassword = 'Vui lòng nhập lại mật khẩu';
  else if (f.confirmPassword !== f.password) e.confirmPassword = 'Mật khẩu không khớp';

  if (!f.role) e.role = 'Vui lòng chọn vai trò';
  return e;
}

function firstErrorMsg(errs) {
  const first = Object.values(errs).find(Boolean);
  return typeof first === 'string' ? first : 'Vui lòng kiểm tra lại thông tin';
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff',
  },
  helperError: {
    marginTop: 6,
    fontSize: 12,
    color: '#ef4444',
  },
  button: {
    backgroundColor: '#0099FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: '#0099FF',
    fontWeight: '700',
  },
});
