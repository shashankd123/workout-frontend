import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { workoutPlan as defaultWorkoutPlan } from '../data/workoutPlan';
import EditExerciseModal from './EditExerciseModal';

const WorkoutList = ({ workout, updateWorkout, isEditMode, resetWorkoutCompletion, toggleEditMode }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const swipeableRefs = useRef([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const updateWorkoutTitle = (newTitle) => {
    updateWorkout({ ...workout, workout: newTitle });
  };

  const updateExerciseField = (index, field, value) => {
    const updatedExercises = workout.exercises.map((exercise, i) => {
      if (i === index) {
        return { ...exercise, [field]: value };
      }
      return exercise;
    });
    updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const toggleExerciseCompletion = (index) => {
    if (swipeableRefs.current[index]) {
      swipeableRefs.current[index].close();
    }
    const updatedExercises = workout.exercises.map((exercise, i) => {
      if (i === index) {
        return { ...exercise, completed: !exercise.completed };
      }
      return exercise;
    });
    updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const deleteExercise = (index) => {
    if (swipeableRefs.current[index]) {
      swipeableRefs.current[index].close();
    }
    const updatedExercises = workout.exercises.filter((_, i) => i !== index);
    updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const addNewExercise = () => {
    const newExercise = {
      name: "New Exercise",
      sets: 3,
      reps: "10",
      completed: false,
    };
    updateWorkout({
      ...workout,
      exercises: [...workout.exercises, newExercise],
    });
  };

  const resetToDefault = () => {
    const selectedDay = workout.day;
    if (selectedDay && defaultWorkoutPlan[selectedDay]) {
      updateWorkout(defaultWorkoutPlan[selectedDay]);
    }
  };

  const openEditModal = (exercise, index) => {
    setSelectedExercise(exercise);
    setSelectedIndex(index);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedExercise(null);
    setSelectedIndex(null);
  };

  const handleSaveExercise = (updatedExercise) => {
    const updatedExercises = [...workout.exercises];
    updatedExercises[selectedIndex] = updatedExercise;
    updateWorkout({
      ...workout,
      exercises: updatedExercises,
    });
    closeEditModal();
  };

  const renderExerciseItem = ({ item, index }) => {
    // Function to check if reps is just a number or range (e.g., "12" or "10-15")
    const isSimpleReps = (reps) => {
      const numberOrRangePattern = /^\d+(-\d+)?$/;
      return numberOrRangePattern.test(reps.trim());
    };

    // Handle reps display
    const repsDisplay = isSimpleReps(item.reps) ? `${item.reps} Reps` : item.reps;

    return (
      <View style={styles.exerciseCard}>
        <TouchableOpacity 
          style={styles.exerciseContent}
          onPress={() => isEditMode && openEditModal(item, index)}
        >
          <View style={styles.exerciseInfo}>
            <Text style={[
              styles.exerciseName,
              item.completed && styles.completedText
            ]}>
              {item.name}
            </Text>
            <View style={styles.detailsRow}>
              <Text style={[
                styles.exerciseDetails,
                item.completed && styles.completedText
              ]}>
                {item.sets} Sets
              </Text>
              <View style={styles.repsContainer}>
                <Text style={[
                  styles.exerciseDetails,
                  item.completed && styles.completedText
                ]}>
                  {repsDisplay}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.rightContent}>
            {isEditMode ? (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteExercise(index)}
              >
                <Icon name="delete" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={() => toggleExerciseCompletion(index)}
              >
                <Icon name="check" size={24} color="#FFB800" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isEditMode) return null;
    
    return (
      <TouchableOpacity 
        style={styles.addButton}
        onPress={addNewExercise}
      >
        <Icon name="add" size={24} color="#000000" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {isEditMode ? (
        <TextInput
          style={styles.workoutTitleInput}
          value={workout.workout}
          onChangeText={updateWorkoutTitle}
          placeholder="Workout Name"
          placeholderTextColor="#666"
        />
      ) : (
        <Text style={styles.workoutTitle}>{workout.workout}</Text>
      )}
      
      <FlatList
        data={workout.exercises}
        renderItem={renderExerciseItem}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={10}
        keyboardShouldPersistTaps={isEditMode ? "handled" : "never"}
        keyboardDismissMode={isEditMode ? "none" : "on-drag"}
        ListFooterComponent={renderFooter}
        ListFooterComponentStyle={styles.footerContainer}
      />

      <View style={styles.buttonContainer}>
        {isEditMode ? (
          <View style={styles.editModeButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.resetDefaultButton]}
              onPress={resetToDefault}
            >
              <Text style={styles.resetDefaultButtonText}>Reset to Default</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.addButton]}
              onPress={addNewExercise}
            >
              <Icon name="add" size={24} color="#000000" />
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetWorkoutCompletion}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
      <EditExerciseModal
        isVisible={editModalVisible}
        exercise={selectedExercise}
        onSave={handleSaveExercise}
        onClose={closeEditModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 15,
  },
  workoutTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginLeft: 10,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseCard: {
    backgroundColor: '#1E1E1E',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  exerciseContent: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  exerciseDetails: {
    color: '#888888',
    fontSize: 14,
  },
  repsContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 15,
  },
  rightContent: {
    marginLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    marginLeft: 10,
  },
  editModeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FFB800',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expandedContent: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: -10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
  },
  inputLabel: {
    color: '#FFFFFF',
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  deleteContainer: {
    width: 75,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FF4444',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetDefaultButton: {
    backgroundColor: '#FF4444',
  },
  resetDefaultButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  swipeContainer: {
    width: 75,
    height: '100%',
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeButton: {
    backgroundColor: '#FFB800',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutTitleInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    padding: 0,
    marginLeft: 10,
  },
  keyboardSpacing: {
    height: 200,
  },
  mainButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  exerciseNameInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    padding: 0,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  completedText: {
    opacity: 0.5,
  },
  completeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#000000',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#FFB800',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});

export default WorkoutList;
