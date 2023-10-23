  <script>
    const API_KEY = "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";
    const API_URL = "https://api.openai.com/v1/chat/completions";

    const inputTextAreaId = "input";
    const submitButtonId = "send";
    const chatHistoryId = "chat";

    let messages = [];

    messages.push({
      role: "system",
      content: `You are Dataist, a GDPR compliance paralegal who does not respond to any inquiries that user provides in non-English language. If the user provided inquiry in non-English language, ignore it completely and respond with "Currently, I am able to help you in the English language only”. Follow the remaining part of the prompt only if the user provides inquiry in English language. When addressing GDPR compliance questions in English, provide the pertinent GDPR information. Keep in mind that data processing must have at least one of the grounds listed in Art. 6(1) of GDPR, including consent under Art. 6(1)(a), as alternatives, not requirements. When discussing consent, always emphasize its role as an alternative ground for processing, not as an obligatory requirement. If the inquiry does not pertain to GDPR compliance, respond with "As a GDPR compliance paralegal, I can only help you with GDPR compliance." After offering GDPR information, cite pertinent information provided by the Court of Justice of the European Union (CJEU) or European Data Protection Board (EDPB). Your response should be concise, specific, well-structured, numbered, and conservative. At the end of each sentence and paragraph always include references to specific GDPR Articles or Recitals (e.g., "(Art. (Article NO)(paragraph No) of GDPR)" or "(Recital X of GDPR)") and EDPB or CJEU documents (e.g., "(European Data Protection Board's [name of the document] XX/YYYY, p. X)" or "(European Data Protection Board's Opinion XX/YYYY, para. / page X)"). Do not mention webpage addresses of documents.`
    });

    displayInitialMessage();

    async function displayInitialMessage() {
      const initialMessage = "Hi. I am Dataist, AI GDPR paralegal. I can provide you with information on GDPR compliance and drafts of of GDPR compliance documents. How can I help? In case you want to talk to lawyer, please let me know";
      const chatGptMessage = document.createElement("div");
      document.getElementById(chatHistoryId).appendChild(chatGptMessage);
      messages.push({ role: "assistant", content: initialMessage });
      await typeMessage(initialMessage, chatGptMessage);
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function typeMessage(message, element) {
      element.innerHTML = `<span class="bold">Dataist:</span> `;
      for (let i = 0; i < message.length; i++) {
        element.innerHTML += message[i];
        await sleep(2);
        scrollToBottom(); // Scroll down in real time as the message is being typed
      }
    }

    function isTalkToHumanRequest(userInput) {
      return userInput.toLowerCase().includes("talk to human");
    }

    async function sendMessage() {
      document.getElementById(inputTextAreaId).disabled = true;
      document.getElementById(submitButtonId).disabled = true;

      const userInput = document.getElementById(inputTextAreaId).value;

      if (userInput) {
        const userMessage = document.createElement("div");
        userMessage.innerHTML = `<span class="bold">User:</span> ${userInput}`;
        document.getElementById(chatHistoryId).appendChild(userMessage);

        messages.push({ role: "user", content: userInput });
        scrollToBottom();

        if (isTalkToHumanRequest(userInput)) {
          activateZendeskChat();
          document.getElementById(inputTextAreaId).disabled = false;
          document.getElementById(submitButtonId).disabled = false;
          document.getElementById(inputTextAreaId).value = "";
          return;
        }

        const chatGptMessage = document.createElement("div");
        document.getElementById(chatHistoryId).appendChild(chatGptMessage);
        const thinkingElement = document.createElement("span");
        thinkingElement.innerHTML = `<span class="bold">Dataist</span>: `;
        chatGptMessage.appendChild(thinkingElement);
        const blinkingDots = document.createElement("span");
        blinkingDots.classList.add("blink");
        blinkingDots.textContent = "...";
        thinkingElement.appendChild(blinkingDots);

        const response = await sendRequestToGPT(messages);

        if (response.choices && response.choices.length > 0) {
          chatGptMessage.removeChild(thinkingElement);
          const generatedText = response.choices[0].message.content;

          messages.push({ role: "assistant", content: generatedText });
          await typeMessage(generatedText, chatGptMessage);
        }

        document.getElementById(inputTextAreaId).value = ""; // Clear input text area after sending the message
      }
      // Re-enable the input and send button
      document.getElementById(inputTextAreaId).disabled = false;
      document.getElementById(submitButtonId).disabled = false;
    }

    function scrollToBottom() {
      document.getElementById(chatHistoryId).scrollTop = document.getElementById(chatHistoryId).scrollHeight;
    }

    async function sendRequestToGPT(messages) {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages,
          max_tokens: 1000,
          n: 1,
          temperature: 0.1
        })
      };

      try {
        const response = await fetch(API_URL, requestOptions);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API request failed:", errorData);
          return;
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch API:", error);
      }
    }

    function activateZendeskChat() {
      if (typeof zE === 'undefined' || typeof zE.activate !== 'function') {
        // Load Zendesk Widget script and settings
        const script = document.createElement('script');
        script.id = 'ze-snippet';
        script.src = 'https://static.zdassets.com/ekr/snippet.js?key=d1257bec-586f-4b99-8d5f-0c7b4881e142';
        document.head.appendChild(script);

        window.zESettings = {
          webWidget: {
            launcher: {
              chatLabel: {
                '*': 'Chat'
              }
            },
            chat: {
              suppress: true
            },
            zIndex: 99999
          },
          offset: {
            mobile: {
              horizontal: '0',
              vertical: '0'
            },
            desktop: {
              horizontal: '0',
              vertical: '0'
            }
          }
        };
      } else {
        zE.activate();
      }
    }

    document.getElementById(submitButtonId).addEventListener("click", sendMessage);
    document.getElementById(inputTextAreaId).addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
  </script>
