// source/screens/SplashScreen.js
import{ useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Login'); // hoặc chuyển sang màn chính
    }, 2500); // 2.5 giây splash

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animatable.Image
        animation="fadeIn"
        duration={1500}
        source={require('../../assets/splash.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Animatable.Text animation="fadeInUp" duration={1500} delay={500} style={styles.title}>
        Boarding House
      </Animatable.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e90ff',
  },
});
