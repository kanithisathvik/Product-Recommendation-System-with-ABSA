# Voice Search Debugging Guide

## Issues Fixed

### Problem: Audio not being transcribed correctly
**Solution:** Updated the service to use the exact API format from Gradio documentation:

```javascript
const client = await Client.connect("openai/whisper");
const result = await client.predict("/predict", { 
  inputs: audioBlob,
  task: "transcribe"
});
```

### Changes Made:

1. **Improved Audio Recording**
   - Added better MIME type detection (webm, ogg, mp4)
   - Better audio quality settings (16kHz, mono, noise suppression)
   - Collect data every 100ms for smoother recording
   - Better error handling for empty recordings

2. **Enhanced Logging**
   - Detailed console logs at every step
   - Shows audio blob size and type
   - Shows API responses
   - Clear error messages

3. **Better Error Handling**
   - User-friendly error messages
   - Specific messages for each error type
   - Longer error display (7 seconds)
   - Detailed error logging

4. **Test Component Added**
   - `VoiceSearchTest` component in bottom-right corner
   - Two test buttons:
     - **Test API**: Tests with sample audio from Gradio
     - **Test Recording**: Tests with your microphone
   - Shows status and results in real-time

---

## How to Debug

### Step 1: Test the API Connection
1. Look at the **bottom-right corner** of the page
2. Click **"Test API (Sample Audio)"** button
3. Check the console for logs
4. Should see: "✅ API Test Successful!" with transcribed text

**If this fails:**
- Check internet connection
- Check if Gradio API is accessible
- Look at console error messages

### Step 2: Test Your Microphone
1. Click **"Test Recording (Your Voice)"** button
2. Allow microphone permission when prompted
3. **Speak clearly** when you see "🎤 Recording... Speak now!"
4. Wait for transcription (should take 5-10 seconds)
5. Check result in the test panel

**If this fails:**
- Check microphone permissions in browser
- Check if microphone is working (test in other apps)
- Look at console for error details

### Step 3: Use the Main Voice Search
1. Click the **"Voice Search"** button next to "Find Products"
2. Speak your query
3. Check console logs (F12 → Console)
4. Look for messages starting with `[Voice Input]`

---

## Console Logs to Check

### Successful Recording:
```
[Voice Input] ========================================
[Voice Input] Starting voice recording workflow...
[Audio Recording] Requesting microphone access...
[Audio Recording] Microphone access granted
[Audio Recording] Using MIME type: audio/webm;codecs=opus
[Audio Recording] Starting recording...
[Audio Recording] Chunk received: 2048 bytes
[Audio Recording] Chunk received: 2048 bytes
...
[Audio Recording] Recording stopped
[Audio Recording] Total chunks: 95
[Audio Recording] Audio blob created:
  - Size: 194560 bytes
  - Type: audio/webm;codecs=opus
[Speech-to-Text] Connecting to Whisper API...
[Speech-to-Text] Audio blob size: 194560 bytes
[Speech-to-Text] Audio blob type: audio/webm;codecs=opus
[Speech-to-Text] Connected. Sending audio for transcription...
[Speech-to-Text] API Response: {data: "laptop with good battery"}
[Speech-to-Text] Transcription data: laptop with good battery
[Speech-to-Text] Transcription complete: laptop with good battery
[Voice Input] ========================================
[Voice Input] SUCCESS! Transcribed text: laptop with good battery
[Voice Input] ========================================
```

### Failed Recording (No Audio):
```
[Audio Recording] Recording stopped
[Audio Recording] Total chunks: 0
[Audio Recording] Error: Recording failed: No audio data captured
```
**Fix:** Speak louder or check microphone

### Failed API Call:
```
[Speech-to-Text] Error during transcription: Failed to fetch
```
**Fix:** Check internet connection

---

## Common Issues

### Issue 1: "Microphone access denied"
**Symptoms:**
- Error message appears immediately
- Console shows: "Microphone access denied"

**Solutions:**
1. Click the 🔒 or 🎥 icon in browser address bar
2. Allow microphone access
3. Refresh the page
4. Try again

### Issue 2: "No audio data captured"
**Symptoms:**
- Recording completes but no audio
- Console shows: "Total chunks: 0"

**Solutions:**
1. Check if microphone is plugged in
2. Check microphone is not muted
3. Test microphone in other apps
4. Try different browser (Chrome recommended)

### Issue 3: "No transcription returned"
**Symptoms:**
- Recording works but transcription fails
- Console shows empty or null result

**Solutions:**
1. Speak more clearly
2. Reduce background noise
3. Speak closer to microphone
4. Try shorter phrases

### Issue 4: Incorrect transcription
**Symptoms:**
- Text is wrong or garbled

**Solutions:**
1. Speak more slowly and clearly
2. Use a quiet environment
3. Use a better microphone (headset)
4. Manually edit the transcribed text

### Issue 5: Browser not supported
**Symptoms:**
- Error: "Your browser does not support audio recording"

**Solutions:**
1. Update browser to latest version
2. Use supported browsers:
   - ✅ Chrome 90+
   - ✅ Firefox 88+
   - ✅ Edge 90+
   - ✅ Safari 14.1+

---

## Testing Checklist

- [ ] Test panel appears in bottom-right corner
- [ ] "Test API" button works with sample audio
- [ ] "Test Recording" button captures your voice
- [ ] Main "Voice Search" button is visible
- [ ] Clicking voice button shows recording state
- [ ] Recording state shows red pulsing button
- [ ] Processing state shows yellow spinner
- [ ] Transcribed text appears in search box
- [ ] Can search with transcribed text
- [ ] Aspects are detected from transcribed text
- [ ] Errors show user-friendly messages
- [ ] Console shows detailed logs

---

## Browser Console Commands

Open console (F12) and try these:

### Test API directly:
```javascript
import { testWhisperAPI } from './services/speechToTextService';
testWhisperAPI().then(console.log).catch(console.error);
```

### Test recording directly:
```javascript
import { speechToText } from './services/speechToTextService';
speechToText(10).then(console.log).catch(console.error);
```

### Check if microphone is available:
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone available'))
  .catch(err => console.error('❌ Microphone error:', err));
```

### Check supported MIME types:
```javascript
['audio/webm', 'audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']
  .forEach(type => {
    console.log(type, ':', MediaRecorder.isTypeSupported(type) ? '✅' : '❌');
  });
```

---

## Removing Test Component

Once everything works, remove the test component:

1. Open `src/ProductRecommendationApp.jsx`
2. Remove line: `import VoiceSearchTest from './components/VoiceSearchTest';`
3. Remove line: `<VoiceSearchTest />`
4. Save the file

---

## API Response Format

The Whisper API returns data in this format:

```javascript
{
  data: "transcribed text here",
  duration: 2.5,
  // other metadata
}
```

We extract `result.data` to get the transcribed text.

---

## Performance Tips

1. **Keep recordings short** (< 10 seconds) for faster transcription
2. **Speak clearly** at normal pace
3. **Quiet environment** improves accuracy
4. **Use headset** for best quality
5. **Good internet** for API calls

---

## Success Indicators

✅ **Recording works** when you see:
- Red pulsing button
- "🎤 Listening..." message
- Audio chunks in console

✅ **API works** when you see:
- "Connected to Whisper API" in console
- API response with data
- Transcribed text returned

✅ **Feature works** when:
- Text appears in search box
- Can search with voice
- Aspects detected from speech
- No error messages

---

## Next Steps

If everything works:
1. ✅ Remove test component (optional)
2. ✅ Test with different queries
3. ✅ Test aspect detection with voice
4. ✅ Test ABSA with voice input
5. ✅ Commit changes to GitHub

If issues persist:
1. Share console logs
2. Share browser/OS details
3. Test in different browser
4. Check Gradio API status
