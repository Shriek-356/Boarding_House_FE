import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import * as yup from 'yup';
import { loginApi } from '../api/authApi';
import LottieView from 'lottie-react-native';//Lottie animation
import Toast from 'react-native-toast-message';

// Schema validate
const schema = yup.object().shape({
    username: yup.string().required('Vui lòng nhập tên đăng nhập'),
    password: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
});



const LoginScreen = ({ navigation }) => {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const animationSource = require('../../assets/animations/loading.json');
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        console.log('Dữ liệu hợp lệ:', data);
        setIsLoading(true);

        try {
            const response = await loginApi(data);
            Toast.show({
                type: 'success',
                text1: 'Đăng nhập thành công',
                text2: '',
                position: 'bottom',
            });
            navigation.navigate('Home');
        } catch (error) {
            // Xử lý lỗi an toàn
            let message = 'Đã xảy ra lỗi không xác định.';

            if (error.response) {
                // Lỗi từ phía server (backend trả về)
                if (typeof error.response.data === 'string') {
                    message = error.response.data;
                } else if (error.response.data.message) {
                    message = error.response.data.message;
                } else {
                    message = JSON.stringify(error.response.data);
                }
            } else if (error.request) {
                // Request đã gửi đi nhưng không nhận được phản hồi
                message = 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng.';
            } else {
                // Lỗi khi thiết lập request
                message = error.message;
            }

            Toast.show({
                type: 'error',
                text1: 'Lỗi đăng nhập',
                text2: message,
                position: 'bottom',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
                        name="username"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Tên đăng nhập"
                                mode="outlined"
                                left={<TextInput.Icon icon="account-outline" />}
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                error={!!errors.username}
                                style={styles.input}
                                outlineStyle={styles.inputOutline}
                                activeOutlineColor={theme.colors.primary}
                                autoCapitalize="none"
                                keyboardType="default"
                            />
                        )}
                    />
                    {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

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
                        style={[styles.button, { backgroundColor: '#0099FF' }]}
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
            {
                isLoading && (
                    <View style={styles.loadingOverlay}>
                        <LottieView
                            source={animationSource}
                            autoPlay
                            loop
                            style={{ width: 200, height: 200 }}
                        />
                        <Text style={styles.loadingText}>Đang đăng nhập...</Text>
                    </View>
                )
            }
        </>
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
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', // làm mờ
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },

    loadingText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;