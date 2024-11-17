// Real API service
const API_URL = 'https://workout-backend-hn9k.onrender.com'; // Production endpoint
const TIMEOUT_DURATION = 120000; // 2 minutes: 60s cold start + 30s AI generation + 30s buffer

export const generateWorkout = async (formData) => {
  try {
    console.log('Sending request to server:', formData);
    
    // Create an AbortController for the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    const response = await fetch(`${API_URL}/api/generate-workout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: controller.signal
    });

    // Clear the timeout since we got a response
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server error:', errorData);
      throw new Error('Failed to generate workout');
    }

    const data = await response.json();
    console.log('Server response:', data);
    return data;
  } catch (error) {
    console.error('Error in generateWorkout:', error);
    if (error.name === 'AbortError') {
      throw new Error('The request is taking longer than expected. This might be because:\n\n1. First-time request: Server needs to wake up (≈60 seconds)\n2. AI Generation: Creating your workout (≈30 seconds)\n\nPlease try again. Subsequent requests will be faster!');
    }
    throw error;
  }
};
