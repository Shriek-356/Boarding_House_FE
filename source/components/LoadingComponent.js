import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
const LoadingComponent = ({loadingText}) => {
  return (
    <View style={styles.loadingContainer}>
      <LottieView
        source={require('../../assets/animations/loading.json')}
        autoPlay
        loop
        style={{ width: 60, height: 60 }}
      />
      <Text style={styles.loadingText}>{loadingText || 'Đang xử lý...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6B7280',
  }
});

export default LoadingComponent;