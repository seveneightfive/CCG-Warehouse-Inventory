"use client";

import { useEffect, useRef, useState } from "react";

export default function VoiceTextarea({ value, onChange, placeholder }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(!!SpeechRecognition);
  }, []);

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    baseTextRef.current = value ? value + " " : "";
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onChange(baseTextRef.current + transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {supported && (
        <button
          type="button"
          className={`micBtn ${listening ? "listening" : ""}`}
          onClick={listening ? stopListening : startListening}
        >
          {listening ? "Stop dictating" : "Speak instead of typing"}
        </button>
      )}
    </div>
  );
}
