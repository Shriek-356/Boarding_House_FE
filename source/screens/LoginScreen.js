import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Schema validate
const schema = yup.object().shape({
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  password: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
});

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log('Dữ liệu hợp lệ:', data);
    // TODO: Gọi API login, nếu thành công thì chuyển màn hình:
    // navigation.navigate('Home');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/splash.png')} // Thay bằng đường dẫn logo của bạn
            style={styles.logo}
          />
          <Text style={[styles.appName, { color: theme.colors.primary }]}>Boarding House</Text>
          <Text style={styles.subtitle}>Chào mừng bạn quay lại!</Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              mode="outlined"
              left={<TextInput.Icon icon="email-outline" />}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.email}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              activeOutlineColor={theme.colors.primary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Mật khẩu"
              mode="outlined"
              left={<TextInput.Icon icon="lock-outline" />}
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.password}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              activeOutlineColor={theme.colors.primary}
            />
          )}
        />
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')} // Giả sử có màn hình ForgotPassword
          style={styles.forgotPassword}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[styles.button, { backgroundColor: '#0099FF' }]} // Màu xanh biển nhạt
          contentStyle={{ paddingVertical: 10 }}
          labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}
        >
          Đăng nhập
        </Button>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 16,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 8,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  inputOutline: {
    borderRadius: 10,
    borderWidth: 1,
  },
  button: {
    marginTop: 24,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  error: {
    color: '#EF4444',
    marginBottom: 12,
    fontSize: 14,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  registerText: {
    fontSize: 15,
    color: '#4B5563',
  }
});

export default LoginScreen;