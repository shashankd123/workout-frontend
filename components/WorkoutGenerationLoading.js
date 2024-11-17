import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const WorkoutGenerationLoading = ({ onTimeout, receivedResponse }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const coldStartProgressAnim = useRef(new Animated.Value(0)).current;
  const iconSpinValue = useRef(new Animated.Value(0)).current;
  
  // State for managing different phases
  const [isColdStart, setIsColdStart] = useState(false);
  
  // Spin animation for the server icon
  const spin = iconSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    // Initial 30-second progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 30000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();

    // Check for cold start after 10 seconds
    const coldStartTimer = setTimeout(() => {
      if (!receivedResponse) {
        setIsColdStart(true);
        // Start 60-second cold start animation
        Animated.timing(coldStartProgressAnim, {
          toValue: 1,
          duration: 60000,
          useNativeDriver: false,
          easing: Easing.linear,
        }).start();
      }
    }, 10000);

    // Continuous spin animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconSpinValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(iconSpinValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearTimeout(coldStartTimer);
    };
  }, [fadeAnim, progressAnim, coldStartProgressAnim, receivedResponse]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const coldStartProgressWidth = coldStartProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {isColdStart ? (
          <>
            <Animated.View style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}>
              <Icon name="settings" size={40} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.title}>First-time Request</Text>
            <Text style={styles.subtitle}>Server is warming up...</Text>
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  styles.coldStartBar,
                  { width: coldStartProgressWidth }
                ]} 
              />
            </View>
            <Text style={styles.timeText}>This may take up to 60 seconds</Text>
          </>
        ) : (
          <>
            <Icon name="fitness-center" size={40} color="#FFFFFF" />
            <Text style={styles.title}>Generating Your Workout Plan</Text>
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressWidth }
                ]} 
              />
            </View>
            <Text style={styles.timeText}>Customizing your perfect workout...</Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    width: width * 0.8,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  coldStartBar: {
    backgroundColor: '#FF9500',
  },
  timeText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default WorkoutGenerationLoading;
