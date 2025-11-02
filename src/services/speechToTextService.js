/**
 * Speech-to-Text Service using Web Speech API (Browser Native)
 * 
 * This service handles voice input transcription using browser's built-in speech recognition
 * Features:
 * - Records audio from microphone
 * - Converts speech to text using Web Speech API
 * - Returns transcribed text for search queries
 * - No external API needed!
 */

/**
 * Convert speech to text using browser's Web Speech API
 * This is a native browser feature - no external API needed!
 * 
 * @param {number} maxDuration - Maximum recording duration in seconds
 * @returns {Promise<string>} - Transcribed text
 */
export const speechToText = (maxDuration = 10) => {
  return new Promise((resolve, reject) => {
    console.log('[Speech-to-Text] Starting browser speech recognition...');
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.'));
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    let finalTranscript = '';
    let timeout;
    
    recognition.onstart = () => {
      console.log('[Speech-to-Text] ✓ Speech recognition started');
      console.log('[Speech-to-Text] Listening for speech...');
      
      // Auto-stop after maxDuration
      timeout = setTimeout(() => {
        console.log('[Speech-to-Text] Max duration reached, stopping...');
        recognition.stop();
      }, maxDuration * 1000);
    };
    
    recognition.onresult = (event) => {
      console.log('[Speech-to-Text] Got speech result event');
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          console.log('[Speech-to-Text] Final transcript chunk:', transcript);
        }
      }
    };
    
    recognition.onerror = (event) => {
      clearTimeout(timeout);
      console.error('[Speech-to-Text] ✗ Recognition error:', event.error);
      
      let errorMessage = 'Speech recognition failed';
      
      switch(event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again and speak clearly.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not detected. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      reject(new Error(errorMessage));
    };
    
    recognition.onend = () => {
      clearTimeout(timeout);
      console.log('[Speech-to-Text] Recognition ended');
      
      const transcribedText = finalTranscript.trim();
      
      if (transcribedText) {
        console.log('[Speech-to-Text] ✓ SUCCESS! Transcribed:', transcribedText);
        resolve(transcribedText);
      } else {
        reject(new Error('No speech was detected. Please try again and speak clearly into your microphone.'));
      }
    };
    
    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      clearTimeout(timeout);
      console.error('[Speech-to-Text] Failed to start recognition:', error);
      reject(new Error('Failed to start speech recognition: ' + error.message));
    }
  });
};

export default {
  speechToText
};


