import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DaySelection = ({ selectedDay, onSelectDay }) => {
  return (
    <View style={styles.container}>
      {days.map((day) => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            selectedDay === day && styles.selectedDayButton,
          ]}
          onPress={() => onSelectDay(day)}
        >
          <Text style={[
            styles.dayButtonText,
            selectedDay === day && styles.selectedDayButtonText,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    padding: 10,
  },
  dayButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  selectedDayButton: {
    backgroundColor: '#FFB800',
  },
  dayButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedDayButtonText: {
    color: '#000000',
  },
});

export default DaySelection;
