import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const DayWorkout = ({day, workout, exercises}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.dayContainer}>
      <TouchableOpacity 
        style={styles.dayHeader} 
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.dayText}>{day}</Text>
        <Text style={styles.workoutTypeText}>{workout}</Text>
      </TouchableOpacity>
      
      {isExpanded && exercises.length > 0 && (
        <View style={styles.exercisesContainer}>
          {exercises.map((exercise, index) => (
            <View key={`${day}-${index}`} style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.exerciseDetails}>
                <Text style={styles.exerciseText}>Sets: {exercise.sets}</Text>
                <Text style={styles.exerciseText}>Reps: {exercise.reps}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      
      {isExpanded && exercises.length === 0 && (
        <View style={styles.restDayContainer}>
          <Text style={styles.restDayText}>Rest Day</Text>
        </View>
      )}
    </View>
  );
};

const WorkoutPlanDisplay = ({workoutPlan}) => {
  if (!workoutPlan) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Generate a workout plan to get started!
        </Text>
      </View>
    );
  }

  // Sort days in correct order
  const daysOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Your Workout Plan</Text>
        {daysOrder.map((day) => {
          const dayPlan = workoutPlan[day];
          if (!dayPlan) return null;

          return (
            <DayWorkout
              key={day}
              day={day}
              workout={dayPlan.workout}
              exercises={dayPlan.exercises}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB800',
    marginBottom: 20,
    textAlign: 'center',
  },
  dayContainer: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#444',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutTypeText: {
    fontSize: 16,
    color: '#FFB800',
  },
  exercisesContainer: {
    padding: 16,
  },
  exerciseItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 12,
  },
  exerciseItem: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  exerciseText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  restDayContainer: {
    padding: 16,
    alignItems: 'center',
  },
  restDayText: {
    color: '#888888',
    fontSize: 16,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E',
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default WorkoutPlanDisplay;
