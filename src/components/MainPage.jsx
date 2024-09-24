import React, { useState, useEffect } from 'react';
import './MainPage.css'

const MainPage = () => {
  const [content, setContent] = useState("Click here to speak");
  const [responseText, setResponseText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.onresult = handleResult;
      setRecognition(recognitionInstance);
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    speak("Initializing MASTER...");
    wishMe();
  }, []);

  const speak = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      utterance.rate = 1;
      utterance.volume = 1;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', setVoice);
    }
  };

  const wishMe = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
      speak("Good Afternoon Praduman sir...");
    } else {
      speak("Good Evening Sir...");
    }
  };

  const handleMicrophoneClick = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setContent("Listening...");
    recognition.start();
  };

  const handleResult = (event) => {
    const transcript = event.results[0][0].transcript;
    setContent(transcript);
    takeCommand(transcript.toLowerCase());
  };

  const handleReadMoreClick = () => {
    setIsExpanded(!isExpanded);
  };

  const getGeminiResponse = async (message) => {
    try {
      const response = await fetch('http://localhost:8080', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching API response:', error);
      return "I'm sorry, I couldn't process your request.";
    }
  };

  const takeCommand = (message) => {
    const websites = {
      google: 'https://google.com',
      youtube: 'https://youtube.com',
      facebook: 'https://facebook.com',
      flipkart: 'https://flipkart.com',
      amazon: 'https://amazon.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    };

    if (message.startsWith('open ')) {
      const site = message.replace('open ', '').trim();
      const url = websites[site.toLowerCase()];
      if (url) {
        window.open(url, '_blank');
        speak(`Opening ${site}`);
      } else {
        window.open(`https://www.google.com/search?q=${site}`, '_blank');
        speak(`This is what I found on the internet regarding ${site}`);
      }
    } else {
      getGeminiResponse(message).then((response) => {
        speak(response);
        displayResponse(response);
      });
    }
  };

  const displayResponse = (response) => {
    const formattedResponse = response
      .replace(/(\w+:)\s+/g, '<strong>$1</strong> ')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*\s(.*?)(?=\n|$)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
      .replace(/\n/g, '<br>')
      .replace(/•/g, '<br>•');

    setResponseText(formattedResponse);
  };

  return (
    <section className="main">
      <ImageContainer />
      <Input onMicrophoneClick={handleMicrophoneClick} content={content} />
      <ResponseContainer
        responseText={responseText}
        isExpanded={isExpanded}
        onReadMoreClick={handleReadMoreClick}
      />
    </section>
  );
};

const ImageContainer = () => (
  <div className="image-container">
    <div className="image">
      <img
        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjJxbDFjY29rcW44YW5lenppajl2NXJrdHc3OG5rZG1ma2VqZG5mbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PXsMzE6KOwgEoWSRkR/giphy.webp"
        alt="image"
      />
    </div>
    <h1>M A S T E R</h1>
    <p>I am a Virtual Assistant MASTER, How may I help you?</p>
  </div>
);

const Input = ({ onMicrophoneClick, content }) => (
  <div className="input">
    <button className="talk" onClick={onMicrophoneClick}>
      <i className="fas fa-microphone-alt"></i>
    </button>
    <h1 className="content">{content}</h1>
  </div>
);

const ResponseContainer = ({ responseText, isExpanded, onReadMoreClick }) => (
  <div className="response-container" style={{ display: responseText ? 'block' : 'none' }}>
    <p
      className={`response-text ${isExpanded ? 'expanded' : ''}`}
      dangerouslySetInnerHTML={{ __html: responseText }}
    ></p>
    <button className="button" onClick={onReadMoreClick}>
      {isExpanded ? 'Read less' : 'Read more'}
    </button>
  </div>
);

export default MainPage;
