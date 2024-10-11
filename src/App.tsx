import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
    } else {
      console.error('Speech recognition not supported');
    }
  }, []);

  const stopListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    const translateText = async () => {
      if (transcript) {
        try {
          const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY_HERE`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: transcript,
              target: targetLanguage,
            }),
          });
          const data = await response.json();
          setTranslation(data.data.translations[0].translatedText);
        } catch (error) {
          console.error('Translation error:', error);
        }
      }
    };

    translateText();
  }, [transcript, targetLanguage]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Speech Transcription and Translation</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex items-center px-4 py-2 rounded-full ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors duration-300`}
          >
            {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <div className="flex items-center">
            <Globe className="mr-2" />
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Transcription:</h2>
          <p className="bg-gray-100 p-3 rounded">{transcript || 'Start speaking to see transcription...'}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Translation:</h2>
          <p className="bg-gray-100 p-3 rounded">{translation || 'Translation will appear here...'}</p>
        </div>
      </div>
    </div>
  );
}

export default App;