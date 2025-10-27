import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinished: () => void;
}

export default function SplashScreen({ onFinished }: SplashScreenProps) {
  // Animation values
  const rotation = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const textScale = useSharedValue(0.8);
  const logoTranslateY = useSharedValue(50);

  useEffect(() => {
    // Start rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );

    // Fade in animation sequence
    fadeIn.value = withTiming(1, { duration: 800 });

    // Logo entrance animation
    logoTranslateY.value = withTiming(0, { duration: 1000 });

    // Text scale animation
    textScale.value = withSequence(
      withTiming(1, { duration: 800 }),
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );

    // Auto-hide after minimum duration
    const timer = setTimeout(() => {
      fadeIn.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onFinished)();
      });
    }, 2000); // Minimum 2 seconds as requested

    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: logoTranslateY.value },
      { scale: interpolate(logoTranslateY.value, [50, 0], [0.8, 1]) }
    ],
  }));

  const textScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, fadeStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Logo section */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Animated.View style={[styles.orbitContainer, rotationStyle]}>
          <MaterialCommunityIcons
            name="orbit"
            size={80}
            color="#ffffff"
          />
        </Animated.View>

        {/* Main title */}
        <Animated.View style={[styles.titleContainer, textScaleStyle]}>
          <Text style={styles.actionText}>Action</Text>
          <Text style={styles.reactionText}> REAction</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={[styles.subtitleContainer, textScaleStyle]}>
          <Text style={styles.subtitle}>Automate Your Digital Life</Text>
        </Animated.View>
      </Animated.View>

      {/* Loading indicator dots */}
      <Animated.View style={[styles.loadingContainer, textScaleStyle]}>
        <LoadingDots />
      </Animated.View>
    </Animated.View>
  );
}

// Loading dots component
function LoadingDots() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dotValue: SharedValue<number>, delay: number) => {
      dotValue.value = withRepeat(
        withSequence(
          withTiming(0, { duration: delay }),
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
          withTiming(0, { duration: 600 - delay })
        ),
        -1,
        false
      );
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a', // Green-600
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#16a34a',
    // Add a subtle radial gradient effect
    opacity: 0.95,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  reactionText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#dcfce7', // Green-100
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbf7d0', // Green-200
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
});