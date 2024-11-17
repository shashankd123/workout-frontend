import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const USER_ID_KEY = 'user_id';

export const getUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    
    if (!userId) {
      userId = uuid.v4();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    
    return userId;
  } catch (error) {
    console.error('Error managing userId:', error);
    throw error;
  }
};
