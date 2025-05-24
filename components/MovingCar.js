import React, { useRef, useEffect } from 'react';
import { Animated, View, Image, StyleSheet, Dimensions, Easing } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const MovingCar = () => {
  const translateX = useRef(new Animated.Value(screenWidth + 300)).current; // להתחיל עוד יותר רחוק מימין

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -400, // יציאה לגמרי מהשמאל
          duration: 6000,
          easing: Easing.linear, // ✅ תנועה חלקה
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: screenWidth + 300,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/car.gif')} // ודא שה-GIF נראה טוב
        style={[styles.car, { transform: [{ translateX }] }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    height: 140,
    overflow: 'hidden',
  },
  car: {
    width: 300,
    height: 140,
  },
});

export default MovingCar;
