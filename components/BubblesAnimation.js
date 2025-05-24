// components/BubblesAnimation.js
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const BubblesAnimation = () => {
  const bubbles = Array.from({ length: 10 }).map(() => ({
    x: useRef(new Animated.Value(Math.random() * width)).current,
    y: useRef(new Animated.Value(height + Math.random() * 300)).current,
    scale: useRef(new Animated.Value(0.5 + Math.random())).current,
  }));

  useEffect(() => {
    bubbles.forEach(({ x, y, scale }) => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(y, {
            toValue: -100,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 3000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {bubbles.map(({ x, y, scale }, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bubble,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                { scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff30',
  },
});

export default BubblesAnimation;
