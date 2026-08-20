// Voice-to-text for the "how did it feel?" check-in step, via the Web Speech API.
// No typing required when it works; falls back to a plain textarea when it doesn't
// (older Safari, permission denied, or just not supported in this browser context).

export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Returns a controller with .start()/.stop(); callbacks fire as recognition progresses. */
export function createRecognizer({ onInterim, onFinal, onError, onEnd }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SR();
  recognizer.lang = 'en-US';
  recognizer.interimResults = true;
  recognizer.continuous = true;

  let finalTranscript = '';

  recognizer.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interim += transcript;
      }
    }
    onInterim?.(finalTranscript.trim() + (interim ? ' ' + interim : ''));
  };

  recognizer.onerror = (event) => onError?.(event.error);
  recognizer.onend = () => {
    onFinal?.(finalTranscript.trim());
    onEnd?.();
  };

  return {
    start: () => {
      finalTranscript = '';
      recognizer.start();
    },
    stop: () => recognizer.stop(),
  };
}
