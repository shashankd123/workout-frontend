import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DaySelection = ({ selectedDay, onSelectDay }) => {
  const handlePrevDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const prevIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    onSelectDay(days[prevIndex]);
  };

  const handleNextDay = () => {
    const currentIndex = days.indexOf(selectedDay);
    const nextIndex = currentIndex === days.length - 1 ? 0 : currentIndex + 1;
    onSelectDay(days[nextIndex]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrevDay} style={styles.arrowButton}>
        <Icon name="chevron-left" size={30} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.dayContainer}>
        <Text style={styles.dayText}>{selectedDay}</Text>
      </View>
      <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton}>
        <Icon name="chevron-right" size={30} color="#FFFFFF" />
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
