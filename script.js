let _speechSynth;
let _voices;
const _cache = {};

function loadVoicesWhenAvailable(onComplete = () => {}) {
  _speechSynth = window.speechSynthesis;
  const voices = _speechSynth.getVoices();

  if (voices.length !== 0) {
    _voices = voices;
    onComplete();
  } else {
    return setTimeout(function () {
      loadVoicesWhenAvailable(onComplete);
    }, 100);
  }
}

function getVoices(locale) {
  if (!_speechSynth) {
    throw new Error("Browser does not support speech synthesis");
  }
  if (_cache[locale]) return _cache[locale];

  _cache[locale] = _voices.filter((voice) => voice.lang === locale);
  return _cache[locale];
}

/**
 * Speak a certain text
 * @param locale the locale this voice requires
 * @param text the text to speak
 * @param onEnd callback if tts is finished
 */

function playByText(locale, text, onEnd) {
  const voices = getVoices(locale);

  const utterance = new window.SpeechSynthesisUtterance();
  utterance.voice = voices[0];
  utterance.pitch = 1;
  utterance.rate = 1;
  utterance.voiceURI = "native";
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 0.8;
  utterance.text = text;
  utterance.lang = locale;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  _speechSynth.cancel();
  _speechSynth.speak(utterance);
}

loadVoicesWhenAvailable(function () {
  console.log("loaded");
});

function speak() {
  setTimeout(() => playByText("en-US", "Hello user"), 300);
}



let open_ai_response ;

let conversation =[
]

function conversationUserAdd(question) {
    conversation.push({role:"user", content:question});
    updateChatContainer();
}


function conversationAssistantAdd(response) {
    conversation.push({role:"assistant", content:response});
    updateChatContainer();
}


async function open_ai() {
    let url = "https://api.openai.com/v1/chat/completions"; // This is the endpoint (location) of the GPT server
    let apikey1 = "sk";
    let apikey2 = "-C6aOCnyOVlIBg4eDV";
    let apikey3 = "sqiT3BlbkFJgC2FydKzb32WpsFWPDw8";
    let apiKey = apikey1 + apikey2 + apikey3;

    let data = {model:"gpt-3.5-turbo", messages:conversation};


    try {
        const response = await fetch(url, {
          method: "POST",
                headers: {
              "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
      const responseData = await response.json();
      const message = responseData.choices[0].message.content;

      conversationAssistantAdd(message);

      setTimeout(() => playByText("en-US", message), 300);
      return message;
    }
      else {
        console.log(response.status)
      }

    } 
    catch(error) {
      console.log("HTTP error", error)
    }

    
}

function updateChatContainer() {
  const chatContainer = document.getElementById("chat-container");
  chatContainer.innerHTML = ""; // Clear the container first

  conversation.forEach(message => {
    const chatBubbleContainer = document.createElement("div");
    chatBubbleContainer.classList.add("chat-bubble-container");

    const label = document.createElement("span");
    label.textContent = message.role === "user" ? "User" : "Assistant";
    label.classList.add("chat-label");

    const chatBubble = document.createElement("div");
    chatBubble.classList.add("chat-bubble");
    chatBubble.classList.add(message.role);

    const content = document.createElement("p");
    content.textContent = message.content;
    chatBubble.appendChild(content);

    chatBubbleContainer.appendChild(label);
    chatBubbleContainer.appendChild(chatBubble);
    chatContainer.appendChild(chatBubbleContainer);
  });
}