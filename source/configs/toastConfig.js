import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export const toastConfig = {
  error: ({ text1, text2 }) => (
    <View style={styles.toastContainerError}>
      <LottieView
        source={require('../../assets/animations/error.json')}
        autoPlay
        loop={false}
        style={styles.toastIcon}
      />
      <View style={styles.toastTextContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        <Text style={styles.toastMessage}>{text2}</Text>
      </View>
    </View>
  ),

  success: ({ text1, text2 }) => (
    <View style={styles.toastContainerSuccess}>
      <LottieView
        source={require('../../assets/animations/success.json')}
        autoPlay
        loop={false}
        style={styles.toastIcon}
      />
      <View style={styles.toastTextContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        <Text style={styles.toastMessage}>{text2}</Text>
      </View>
    </View>
  ),
};

const baseStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderRadius: 16,
  marginHorizontal: 20,
  marginVertical: 10,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 8,
};

const styles = StyleSheet.create({
  toastContainerError: {
    ...baseStyle,
    backgroundColor: '#F87171', // đỏ nhạt
  },
  toastContainerSuccess: {
    ...baseStyle,
    backgroundColor: '#34D399', // xanh lá nhạt
  },
  toastIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  toastMessage: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
});
