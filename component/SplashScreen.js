// SplashScreen.js
import React, {useEffect, useRef} from 'react';
import {Animated, Dimensions, StyleSheet} from 'react-native';

const SplashScreen = ({onFinish}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds
      useNativeDriver: true,
    }).start(() => {
      // Wait for 1 second before navigating to the main screen
      setTimeout(() => onFinish(), 1000);
    });
  }, [fadeAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <Animated.Image
        source={require('../assets/image.png')} // Use your background-removed GIF
        style={[styles.logo, {opacity: fadeAnim}]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.text, {opacity: fadeAnim}]}>
        Tic-Tac-Toe
      </Animated.Text>
    </Animated.View>
  );
};

const {width, height} = Dimensions.get('window'); // Get screen dimensions

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#282C34',
  },
  logo: {
    width: width * 0.2, // 60% of the screen width
    height: height * 0.1, // 30% of the screen height
    marginBottom: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default SplashScreen;
