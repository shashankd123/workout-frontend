import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, TouchableOpacity, View, Text, KeyboardAvoidingView, Platform, BackHandler, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getUserId } from './services/userService';
import Title from './components/Title';
import DaySelection from './components/DaySelection';
import WorkoutList from './components/WorkoutList';
import { workoutPlan as initialWorkoutPlan } from './data/workoutPlan';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GenerateWorkoutModal from './components/GenerateWorkoutModal';
import WorkoutPlanDisplay from './components/WorkoutPlanDisplay';

const fullDayNames = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
  'Sun': 'Sunday'
};

const App = () => {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [workoutPlan, setWorkoutPlan] = useState(initialWorkoutPlan);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [generatedWorkoutPlan, setGeneratedWorkoutPlan] = useState(null);
  const [showGeneratedPlan, setShowGeneratedPlan] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
        await loadWorkoutPlan();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [showGeneratedPlan, isEditMode]);

  const handleBackPress = () => {
    if (showGeneratedPlan) {
      setShowGeneratedPlan(false);
      return true;
    }
    if (isEditMode) {
      setIsEditMode(false);
      return true;
    }
    return false;
  };

  const loadWorkoutPlan = async () => {
    try {
      const savedWorkoutPlan = await AsyncStorage.getItem('workoutPlan');
      if (savedWorkoutPlan !== null) {
        setWorkoutPlan(JSON.parse(savedWorkoutPlan));
      } else {
        setWorkoutPlan(initialWorkoutPlan);
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
      setWorkoutPlan(initialWorkoutPlan);
    }
  };

  const saveWorkoutPlan = async (updatedWorkoutPlan) => {
    try {
      await AsyncStorage.setItem('workoutPlan', JSON.stringify(updatedWorkoutPlan));
    } catch (error) {
      console.error('Error saving workout plan:', error);
    }
  };

  const updateWorkout = (updatedWorkout) => {
    const fullDayName = fullDayNames[selectedDay];
    const newWorkoutPlan = { ...workoutPlan, [fullDayName]: updatedWorkout };
    setWorkoutPlan(newWorkoutPlan);
    saveWorkoutPlan(newWorkoutPlan);
  };

  const resetWorkoutCompletion = () => {
    const fullDayName = fullDayNames[selectedDay];
    const updatedWorkout = {
      ...workoutPlan[fullDayName],
      exercises: workoutPlan[fullDayName].exercises.map(exercise => ({
        ...exercise,
        completed: false
      }))
    };
    const newWorkoutPlan = { ...workoutPlan, [fullDayName]: updatedWorkout };
    setWorkoutPlan(newWorkoutPlan);
    saveWorkoutPlan(newWorkoutPlan);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleResetPress = () => {
    if (isEditMode) {
      const fullDayName = fullDayNames[selectedDay];
      if (fullDayName && initialWorkoutPlan[fullDayName]) {
        updateWorkout({
          ...initialWorkoutPlan[fullDayName],
          day: fullDayName
        });
      }
    } else {
      resetWorkoutCompletion();
    }
  };

  const handleGenerateWorkout = (workoutPlan) => {
    console.log('Generate workout with:', workoutPlan);
    setGeneratedWorkoutPlan(workoutPlan);
    setShowGeneratedPlan(true);
    setIsGenerateModalVisible(false);
  };

  const handleSaveGeneratedPlan = () => {
    if (generatedWorkoutPlan) {
      setWorkoutPlan(generatedWorkoutPlan);
      saveWorkoutPlan(generatedWorkoutPlan);
      setShowGeneratedPlan(false);
      setGeneratedWorkoutPlan(null);
      Alert.alert(
        'Success',
        'Workout plan has been saved successfully!',
        [{ text: 'OK' }]
      );
    }
  };

  if (showGeneratedPlan && generatedWorkoutPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowGeneratedPlan(false)}
          >
            <Icon name="arrow-back" size={24} color="#FFB800" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveGeneratedPlan}
          >
            <Text style={styles.saveButtonText}>Save Plan</Text>
          </TouchableOpacity>
        </View>
        <WorkoutPlanDisplay workoutPlan={generatedWorkoutPlan} />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.header}>
          <Title />
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => setIsGenerateModalVisible(true)}
          >
            <Icon name="auto-fix-high" size={24} color="#FFB800" />
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <DaySelection selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          {workoutPlan && (
            <WorkoutList 
              workout={{
                ...workoutPlan[fullDayNames[selectedDay]],
                day: fullDayNames[selectedDay]
              }}
              updateWorkout={updateWorkout}
              isEditMode={isEditMode}
              resetWorkoutCompletion={resetWorkoutCompletion}
            />
          )}
        </KeyboardAvoidingView>
        
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleResetPress}
          >
            <Text style={styles.resetButtonText}>
              {isEditMode ? "Default" : "Reset"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, isEditMode && styles.activeEditButton]} 
            onPress={toggleEditMode}
          >
            <Text style={styles.editButtonText}>
              {isEditMode ? "SAVE" : "EDIT"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <GenerateWorkoutModal
          isVisible={isGenerateModalVisible}
          onClose={() => setIsGenerateModalVisible(false)}
          onGenerate={handleGenerateWorkout}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FFB800',
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  activeEditButton: {
    backgroundColor: '#4CAF50',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 15,
  },
  generateButton: {
    padding: 8,
    marginTop: 20,
  },
  backButton: {
    padding: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
