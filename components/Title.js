import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Title = () => {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.titleText}>WORKOUT</Text>
      <Text style={styles.subtitleText}>PLANNER</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  titleText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF4444',
    letterSpacing: 1,
  }
});

export default Title;
