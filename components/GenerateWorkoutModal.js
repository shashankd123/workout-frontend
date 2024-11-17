import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { generateWorkout } from '../services/api';
import { getUserId } from '../services/userService';
import WorkoutGenerationLoading from './WorkoutGenerationLoading';

const validationRules = {
  age: { min: 16, max: 90, message: 'Age must be between 16-90 years' },
  height: { min: 140, max: 220, message: 'Height must be between 140-220 cm' },
  weight: { min: 40, max: 200, message: 'Weight must be between 40-200 kg' },
  bfp: { min: 3, max: 50, message: 'Body fat % must be between 3-50%', decimal: true }
};

const GenerateWorkoutModal = ({ isVisible, onClose, onGenerate }) => {
  const [formData, setFormData] = useState({
    name: '',
    userId: null,
    gender: 'Select Gender',
    age: '',
    height: '',
    weight: '',
    bfp: '',
    experienceLevel: 'Select Experience Level',
    fitnessGoal: 'Select Fitness Goal',
    equipmentAccess: 'Select Equipment Access',
    injuries: '',
    preferredWorkoutTypes: 'Select Workout Types',
    timeAvailable: 'Select Time Available',
    personalPreference: '', // Added new field
  });

  const [validationErrors, setValidationErrors] = useState({
    age: null,
    height: null,
    weight: null,
    bfp: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [receivedResponse, setReceivedResponse] = useState(false);
  const [showSelector, setShowSelector] = useState('');
  const [activeTooltip, setActiveTooltip] = useState(null);

  const options = {
    gender: ['Male', 'Female', 'Other'],
    fitnessGoal: [
      'Weight Loss',
      'Muscle Gain',
      'Strength',
      'Endurance',
      'General Fitness',
      'Athletic Performance',
    ],
    experienceLevel: ['Beginner', 'Intermediate', 'Advanced'],
    equipmentAccess: ['No Equipment', 'Basic Home Gym', 'Full Gym Access'],
    preferredWorkoutTypes: ['Strength Training', 'Cardio', 'HIIT'],
    timeAvailable: [
      'Less than 30 minutes',
      '30-45 minutes',
      '45-60 minutes',
      '60-90 minutes',
      'More than 90 minutes',
    ],
  };

  const getLoadingMessage = () => {
    if (!isLoading) return 'Generating your workout plan...';
    
    const elapsedSeconds = Math.floor((Date.now() - Date.now()) / 1000);
    
    // For quick responses (server is warm)
    if (elapsedSeconds < 5) {
      return 'Generating your personalized workout plan...';
    }
    // After 5 seconds, we know it might be a cold start
    else if (elapsedSeconds < 60) {
      return 'Server is warming up...\nThis might take about a minute for first-time requests.';
    } else if (elapsedSeconds < 90) {
      return 'Almost there!\nGenerating your personalized workout plan using AI...';
    } else {
      return 'Finalizing your workout plan...';
    }
  };

  const Tooltip = ({ visible, message }) => {
    if (!visible) return null;
    
    return (
      <View style={styles.tooltipContainer}>
        <View style={styles.tooltipArrow} />
        <View style={styles.tooltipContent}>
          <Text style={styles.tooltipText}>{message}</Text>
        </View>
      </View>
    );
  };

  const validateField = (field, value) => {
    if (!validationRules[field]) return null;
    
    const rule = validationRules[field];
    const numValue = rule.decimal ? parseFloat(value) : parseInt(value);
    
    if (value && isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    
    if (value && (numValue < rule.min || numValue > rule.max)) {
      return rule.message;
    }
    
    return null;
  };

  const handleNumericInput = (text, field) => {
    // Remove any non-numeric characters except decimal for BFP
    let numericValue = validationRules[field]?.decimal
      ? text.replace(/[^0-9.]/g, '')
      : text.replace(/[^0-9]/g, '');

    // Handle decimal point for BFP
    if (validationRules[field]?.decimal && numericValue.includes('.')) {
      const parts = numericValue.split('.');
      numericValue = parts[0] + '.' + (parts[1] ? parts[1].substring(0, 1) : '');
    }

    setFormData(prev => ({ ...prev, [field]: numericValue }));
    
    // Validate and set error
    const error = validateField(field, numericValue);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSelect = (option, value) => {
    setFormData({ ...formData, [option]: value });
    setShowSelector('');
  };

  const isFormValid = () => {
    // Check for validation errors
    const hasValidationErrors = Object.values(validationErrors).some(error => error !== null);
    
    // Check required numeric fields are filled and valid
    const requiredNumericFields = ['age', 'height', 'weight'];
    const numericFieldsValid = requiredNumericFields.every(field => 
      formData[field] && !validationErrors[field]
    );
    
    // Check other required fields
    const otherFieldsValid = 
      formData.name.trim() !== '' &&
      formData.gender !== 'Select Gender' &&
      formData.experienceLevel !== 'Select Experience Level' &&
      formData.fitnessGoal !== 'Select Fitness Goal' &&
      formData.equipmentAccess !== 'Select Equipment Access' &&
      formData.preferredWorkoutTypes !== 'Select Workout Types' &&
      formData.timeAvailable !== 'Select Time Available';

    return !hasValidationErrors && numericFieldsValid && otherFieldsValid;
  };

  const renderInputWithValidation = (field, label, placeholder) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            validationErrors[field] && styles.inputError
          ]}
          value={formData[field]}
          onChangeText={(text) => {
            handleNumericInput(text, field);
            setActiveTooltip(null); // Hide tooltip when typing
          }}
          onFocus={() => setActiveTooltip(null)} // Hide tooltip when input is focused
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor="#666"
        />
        {validationErrors[field] && (
          <View>
            <TouchableOpacity 
              style={styles.errorIcon}
              onPress={() => setActiveTooltip(activeTooltip === field ? null : field)}
            >
              <Icon name="error-outline" size={24} color="#FF4444" />
            </TouchableOpacity>
            <Tooltip 
              visible={activeTooltip === field}
              message={validationErrors[field]}
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderSelector = (field) => (
    <Modal
      visible={showSelector === field}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.selectorOverlay}>
        <View style={styles.selectorContent}>
          <Text style={styles.selectorTitle}>
            {field === 'preferredWorkoutTypes'
              ? 'Select Workout Types'
              : `Select ${field.replace(/([A-Z])/g, ' $1').trim()}`}
          </Text>
          {options[field].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionButton}
              onPress={() => handleSelect(field, option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.selectorCancelButton}
            onPress={() => setShowSelector('')}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleGenerate = async () => {
    if (!isFormValid()) {
      Alert.alert(
        'Incomplete Form',
        'Please fill in all required fields before generating a workout plan.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoading(true);
      setReceivedResponse(false);
      
      // Remove optional fields if they're empty
      const cleanedFormData = {
        ...formData,
        bfp: formData.bfp.trim() || undefined,
        injuries: formData.injuries.trim() || undefined,
        personalPreference: formData.personalPreference.trim() || undefined,
        workoutType: formData.preferredWorkoutTypes
      };
      
      const workoutPlan = await generateWorkout(cleanedFormData);
      setReceivedResponse(true);
      
      if (workoutPlan) {
        onGenerate(workoutPlan);
        onClose();
        // Reset form data
        setFormData({
          name: '',
          userId: null,
          gender: 'Select Gender',
          age: '',
          height: '',
          weight: '',
          bfp: '',
          experienceLevel: 'Select Experience Level',
          fitnessGoal: 'Select Fitness Goal',
          equipmentAccess: 'Select Equipment Access',
          injuries: '',
          preferredWorkoutTypes: 'Select Workout Types',
          timeAvailable: 'Select Time Available',
          personalPreference: '', // Reset new field
        });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
      setReceivedResponse(false);
    }
  };

  useEffect(() => {
    const initializeUserId = async () => {
      try {
        const id = await getUserId();
        setFormData(prev => ({ ...prev, userId: id }));
      } catch (error) {
        console.error('Error getting userId:', error);
      }
    };

    if (isVisible) {
      initializeUserId();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      {isLoading ? (
        <WorkoutGenerationLoading
          receivedResponse={receivedResponse}
        />
      ) : (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Generate Workout Plan</Text>

              <Text style={styles.sectionTitle}>Basic Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setShowSelector('gender')}
                >
                  <Text style={styles.selectorButtonText}>{formData.gender}</Text>
                </TouchableOpacity>
              </View>

              {renderInputWithValidation('age', 'Age', 'Enter your age')}

              {renderInputWithValidation('height', 'Height (cm)', 'Enter height in cm')}

              {renderInputWithValidation('weight', 'Weight (kg)', 'Enter weight in kg')}

              {renderInputWithValidation('bfp', 'Body Fat % (optional)', 'Enter body fat percentage')}

              <Text style={styles.sectionTitle}>Fitness Profile</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Experience Level</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setShowSelector('experienceLevel')}
                >
                  <Text style={styles.selectorButtonText}>{formData.experienceLevel}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fitness Goal</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setShowSelector('fitnessGoal')}
                >
                  <Text style={styles.selectorButtonText}>{formData.fitnessGoal}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Workout Types</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setShowSelector('preferredWorkoutTypes')}
                >
                  <Text style={styles.selectorButtonText}>{formData.preferredWorkoutTypes}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Practical Considerations</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Equipment Access</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setShowSelector('equipmentAccess')}
                >
                  <Text style={styles.selectorButtonText}>{formData.equipmentAccess}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Time Available (per session)</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={() => setShowSelector('timeAvailable')}
                >
                  <Text style={styles.selectorButtonText}>{formData.timeAvailable}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Additional Info</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Injuries/Limitations (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.injuries}
                  onChangeText={(text) => setFormData({ ...formData, injuries: text })}
                  placeholder="List any injuries or limitations"
                  placeholderTextColor="#666"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Personal Preference (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.personalPreference}
                  onChangeText={(text) => setFormData({ ...formData, personalPreference: text })}
                  placeholder="Enter any personal preferences for your workout..."
                  placeholderTextColor="#666"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.generateButton,
                    !isFormValid() && styles.disabledButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={handleGenerate}
                  disabled={!isFormValid() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.buttonText}>Generate</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
      {renderSelector('gender')}
      {renderSelector('fitnessGoal')}
      {renderSelector('experienceLevel')}
      {renderSelector('equipmentAccess')}
      {renderSelector('preferredWorkoutTypes')}
      {renderSelector('timeAvailable')}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 5,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 1,
  },
  errorIcon: {
    marginLeft: 10,
    padding: 5,
  },
  tooltipContainer: {
    position: 'absolute',
    right: 0,
    top: 30,
    zIndex: 1000,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#333',
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  tooltipContent: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 4,
    maxWidth: 200,
    width: 150, // Fixed width for better text wrapping
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'left',
    flexWrap: 'wrap',
    lineHeight: 16, // Add line height for better readability
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF4444',
    flex: 1,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#FFB800',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectorButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
  },
  selectorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  selectorContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
  },
  selectorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  sectionTitle: {
    color: '#FFB800',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  selectorCancelButton: {
    backgroundColor: '#FF4444',
    padding: 15,
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default GenerateWorkoutModal;
