    import React, { useMemo, useState } from 'react';
    import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
    import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
    import { SafeAreaView } from 'react-native';
    import { registerUser } from '../api/userApi';
    import Toast from 'react-native-toast-message';
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
            role: 'RENTER',
        });
        const [submitting, setSubmitting] = useState(false);
        const [showPass, setShowPass] = useState(false);
        const [showConfirm, setShowConfirm] = useState(false);

        const errors = useMemo(() => validate(form), [form]);
        const hasError = Object.values(errors).some(Boolean);

        const onChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

        const handleRegister = async () => {
            if (hasError) {
                Alert.alert('Thiếu/ Sai thông tin', firstErrorMsg(errors));
                return;
            }
            setSubmitting(true);
            try {
                // Backend đang nhận @RequestParam Map<String,String> => dùng URLSearchParams
                const formData = new FormData();
                formData.append('username', form.username.trim());
                formData.append('password', form.password);
                formData.append('email', form.email.trim());
                formData.append('phone', form.phone.trim());
                formData.append('firstName', form.firstName.trim());
                formData.append('lastName', form.lastName.trim());
                formData.append('address', form.address.trim());
                formData.append('role', form.role);
                console.log(formData)
                await registerUser(formData);

                Toast.show({
                    type: 'success',
                    text1: 'Thành công',
                    text2: 'Tạo tài khoản thành công! Hãy đăng nhập.',
                });
                navigation.navigate('Login');
            } catch (err) {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: String(err.response.data.error) || 'Đăng ký thất bại vui lòng thử lại sau!',
                });
            } finally {
                setSubmitting(false);
            }
        };

        return (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                        <Text style={styles.header}>Tạo tài khoản</Text>

                        <View style={styles.row}>
                            <Input
                                label="Họ"
                                value={form.lastName}
                                onChangeText={(t) => onChange('lastName', t)}
                                placeholder="Nguyễn"
                                error={errors.lastName}
                                style={{ flex: 1, marginRight: 8 }}
                                autoCapitalize="words"
                            />
                            <Input
                                label="Tên"
                                value={form.firstName}
                                onChangeText={(t) => onChange('firstName', t)}
                                placeholder="An"
                                error={errors.firstName}
                                style={{ flex: 1, marginLeft: 8 }}
                                autoCapitalize="words"
                            />
                        </View>

                        <Input
                            label="Tên đăng nhập"
                            value={form.username}
                            onChangeText={(t) => onChange('username', t)}
                            placeholder="username"
                            error={errors.username}
                            autoCapitalize="none"
                        />

                        <Input
                            label="Email"
                            value={form.email}
                            onChangeText={(t) => onChange('email', t)}
                            placeholder="email@domain.com"
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            label="Số điện thoại"
                            value={form.phone}
                            onChangeText={(t) => onChange('phone', t)}
                            placeholder="0xxxxxxxxx"
                            error={errors.phone}
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Địa chỉ"
                            value={form.address}
                            onChangeText={(t) => onChange('address', t)}
                            placeholder="Số nhà, đường, phường, quận, tỉnh"
                            error={errors.address}
                        />

                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={[styles.input, errors.password && styles.inputError]}>
                                <TextInput
                                    value={form.password}
                                    onChangeText={(t) => onChange('password', t)}
                                    placeholder="••••••••"
                                    secureTextEntry={!showPass}
                                    style={{ flex: 1 }}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
                                    <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={22} />
                                </TouchableOpacity>
                            </View>
                            {!!errors.password && <Text style={styles.helperError}>{errors.password}</Text>}
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={styles.label}>Nhập lại mật khẩu</Text>
                            <View style={[styles.input, errors.confirmPassword && styles.inputError]}>
                                <TextInput
                                    value={form.confirmPassword}
                                    onChangeText={(t) => onChange('confirmPassword', t)}
                                    placeholder="••••••••"
                                    secureTextEntry={!showConfirm}
                                    style={{ flex: 1 }}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
                                    <Icon name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} />
                                </TouchableOpacity>
                            </View>
                            {!!errors.confirmPassword && <Text style={styles.helperError}>{errors.confirmPassword}</Text>}
                        </View>


                        <TouchableOpacity style={[styles.button, hasError && { opacity: 0.8 }]} onPress={handleRegister} disabled={submitting}>
                            {submitting ? (
                                <ActivityIndicator />
                            ) : (
                                <Text style={styles.buttonText}>Đăng ký</Text>
                            )}
                        </TouchableOpacity>

                        <View style={{ alignItems: 'center', marginTop: 12 }}>
                            <Text>
                                Đã có tài khoản?{' '}
                                <Text style={styles.link} onPress={() => navigation?.goBack?.()}>Đăng nhập</Text>
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
        );
    }

    function Input({ label, error, style, ...props }) {
        return (
            <View style={[{ marginBottom: 12 }, style]}>
                <Text style={styles.label}>{label}</Text>
                <View style={[styles.input, error && styles.inputError]}>
                    <TextInput style={{ flex: 1 }} {...props} />
                </View>
                {!!error && <Text style={styles.helperError}>{error}</Text>}
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

        return e;
    }

    function firstErrorMsg(errs) {
        const first = Object.values(errs).find(Boolean);
        return typeof first === 'string' ? first : 'Vui lòng kiểm tra lại thông tin';
    }

    const styles = StyleSheet.create({
        container: {
            padding: 16,
            paddingBottom: 32,
        },
        header: {
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 16,
        },
        row: {
            flexDirection: 'row',
        },
        label: {
            fontSize: 13,
            color: '#555',
            marginBottom: 6,
        },
        input: {
            borderWidth: 1,
            borderColor: '#e5e7eb',
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: '#fff',
            flexDirection: 'row',
            alignItems: 'center',
        },
        inputError: {
            borderColor: '#ef4444',
        },
        helperError: {
            marginTop: 6,
            fontSize: 12,
            color: '#ef4444',
        },
        segment: {
            flexDirection: 'row',
            backgroundColor: '#f1f5f9',
            borderRadius: 12,
            padding: 4,
            marginBottom: 16,
        },
        segmentItem: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 10,
            borderRadius: 10,
        },
        segmentItemActive: {
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        },
        segmentText: {
            fontWeight: '600',
            color: '#64748b',
        },
        segmentTextActive: {
            color: '#111827',
        },
        button: {
            backgroundColor: '#6C5CE7',
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
            color: '#6C5CE7',
            fontWeight: '700',
        },
    });
