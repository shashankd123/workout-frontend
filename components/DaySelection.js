import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DaySelection = ({ selectedDay, onDayChange }) => {
  const currentIndex = days.indexOf(selectedDay);

  const handlePrevDay = () => {
    const newIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    onDayChange(days[newIndex]);
  };

  const handleNextDay = () => {
    const newIndex = currentIndex === days.length - 1 ? 0 : currentIndex + 1;
    onDayChange(days[newIndex]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.arrowButton}
        onPress={handlePrevDay}
      >
        <Icon name="chevron-left" size={40} color="#FFB800" />
      </TouchableOpacity>

      <View style={styles.dayContainer}>
        <Text style={styles.dayText}>{selectedDay}</Text>
      </View>

      <TouchableOpacity
        style={styles.arrowButton}
        onPress={handleNextDay}
      >
        <Icon name="chevron-right" size={40} color="#FFB800" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 10,
  },
  arrowButton: {
    padding: 10,
  },
  dayContainer: {
    // backgroundColor: '#FFB800',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dayText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default DaySelection;
