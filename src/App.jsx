import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
// import Button from "./components/base/Button"; // Removed unused import
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi("80895bf2-66fd-4a71-9c6c-3dcef783c644");

const App = () => {

  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  // hook into Vapi events
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnected(true);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

    });

  }, []);

  // call start handler
  const startCallInline = () => {
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f7f7f7",
      }}
    >
      {!connected ? (
       <img
         src="BetterYou.png"
         alt="Better You"
         onClick={startCallInline}
         style={{
           cursor: "pointer",
           width: "300px",
           height: "auto",
           borderRadius: "50%", // Mimics `rounded-full` for circular appearance
         }}
         className="bounce rounded-full" // Tailwind utility class for bounce animation
       />
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={endCall}
        />
      )}

      {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
    </div>
  );
};

const assistantOptions = {
  name: "AI Voice Clone Assistant",
  firstMessage: "Hello! Welcome to Mirai where you can talk to different versions of you.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "elevenlabs",
    voiceId: "jennifer",
  },
  model: {
    provider: "openai", // Core model for generating affirmations
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
    You are an AI voice assistant designed to enhance users' self-perception and mental well-being by delivering personalized affirmations in their voice.

    Your primary tasks include:
    1) Generating affirmations tailored to the user's current goals, emotional state, and progress.
    2) Incorporating memory from past interactions to make affirmations context-aware and relevant.
    3) Adjusting emotional tones such as confidence, resilience, and positivity in your responses.

    Key guidelines for affirmations:
    - Use positive framing and present tense (e.g., "You are capable and strong").
    - Avoid negative language or comparisons.
    - Include visualization prompts (e.g., "Imagine yourself achieving this with ease").
    - Keep responses short and conversational, reflecting the user's tone and style.
    - When responding to feedback from a voice note, acknowledge the user's emotions (e.g., "I hear that you're feeling overwhelmed") and adapt the affirmation accordingly.

    Always maintain a warm, encouraging, and uplifting tone. Your goal is to help the user feel confident, motivated, and aligned with their aspirations.

    Start by generating a simple affirmation: "You are capable of amazing things, and each day brings you closer to your goals."`,
          },
        ],
      },
    };

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

export default App;
