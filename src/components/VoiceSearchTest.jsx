/**
 * Voice Search Test Component
 * 
 * This component provides a simple UI to test the Whisper API
 * and debug voice input functionality.
 */

import React, { useState } from 'react';
import { testWhisperAPI, speechToText } from '../services/speechToTextService';

const VoiceSearchTest = () => {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTestAPI = async () => {
    setIsLoading(true);
    setStatus('Testing Whisper API with sample audio...');
    setResult('');

    try {
      const text = await testWhisperAPI();
      setStatus('✅ Success!');
      setResult(text);
    } catch (error) {
      setStatus('⚠️ Test Failed');
      
      let errorMsg = error.message;
      if (errorMsg.includes('Failed to fetch')) {
        errorMsg = 'Network error. The API might be down or blocked by CORS. Try the Recording test instead - it may still work!';
      }
      
      setResult(errorMsg);
      console.error('API Test Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRecording = async () => {
    setIsLoading(true);
    setStatus('🎤 Recording... Speak now!');
    setResult('');

    try {
      const text = await speechToText(10);
      setStatus('✅ Success!');
      setResult(`Transcribed: "${text}"`);
    } catch (error) {
      setStatus('⚠️ Test Failed');
      
      let errorMsg = error.message;
      if (errorMsg.includes('denied')) {
        errorMsg = 'Please allow microphone access in your browser and try again.';
      } else if (errorMsg.includes('not supported')) {
        errorMsg = 'Your browser does not support audio recording. Try Chrome, Firefox, or Edge.';
      }
      
      setResult(errorMsg);
      console.error('Recording Test Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '2px solid #8b5cf6',
      borderRadius: '12px',
      padding: '20px',
      minWidth: '300px',
      maxWidth: '400px',
      zIndex: 9999,
      color: 'white',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#8b5cf6' }}>🔧 Voice Search Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleTestAPI}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          Test API (Sample Audio)
        </button>
        
        <button
          onClick={handleTestRecording}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Recording (Your Voice)
        </button>
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '10px',
        fontSize: '12px',
        minHeight: '30px'
      }}>
        {status || 'Ready to test...'}
      </div>
      
      {result && (
        <div style={{
          background: result.includes('⚠️') || result.includes('Network error') || result.includes('Please allow')
            ? 'rgba(239, 68, 68, 0.2)'
            : 'rgba(139, 92, 246, 0.2)',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '12px',
          wordBreak: 'break-word',
          border: result.includes('⚠️') || result.includes('Network error') || result.includes('Please allow')
            ? '1px solid rgba(239, 68, 68, 0.5)'
            : '1px solid rgba(139, 92, 246, 0.5)'
        }}>
          {result}
        </div>
      )}
      
      <div style={{
        marginTop: '15px',
        fontSize: '10px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        💡 If API test fails, try Recording test<br/>
        Check browser console (F12) for details
      </div>
    </div>
  );
};

export default VoiceSearchTest;
