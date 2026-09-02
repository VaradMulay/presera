import { useEffect, useRef, useState, useCallback } from 'react';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
  resultIndex: number;
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const baseTextRef = useRef('');

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      setSupported(false);
      return;
    }

    const rec = new Ctor() as unknown as SpeechRecognitionLike;
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => {
      setListening(true);
      setError('');
    };

    rec.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (typeof (event.results[i] as unknown as { isFinal?: boolean }).isFinal === 'boolean') {
          if ((event.results[i] as unknown as { isFinal: boolean }).isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        } else {
          final += transcript;
        }
      }
      if (final) {
        onTranscriptRef.current(final);
        baseTextRef.current += final;
      }
    };

    rec.onerror = (event: { error: string }) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access was denied. Please allow microphone permissions and try again.');
      } else if (event.error === 'no-speech') {
        // no-speech is benign — recognition auto-restarts in continuous mode
      } else if (event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    rec.onend = () => {
      setListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  const start = useCallback((currentText: string) => {
    const rec = recognitionRef.current;
    if (!rec) {
      setError('Speech recognition is not available in this browser.');
      return;
    }
    baseTextRef.current = currentText;
    setError('');
    try {
      rec.start();
    } catch {
      // start() throws if already started — safe to ignore
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  return { listening, supported, error, start, stop, setError };
}
