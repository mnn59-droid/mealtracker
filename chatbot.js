
// FitTrack Wellness Chatbot - predefined answers, no external API
(function () {
    "use strict";

    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const messages = document.getElementById("chat-messages");
    const newChatButton = document.getElementById("new-chat");

    if (!form || !input || !messages) return;

    // Remember the original welcome screen
    const originalMessages = Array.from(
        messages.children,
        element => element.cloneNode(true)
    );

    // Select an answer based on keywords
    function getReply(question) {
        const q = question.toLowerCase();

        if (/\b(hello|hi|hey)\b/.test(q)) {
            return "Hello! I can share tips about meals, workouts, hydration and healthy habits.";
        }

        if (q.includes("workout") || q.includes("exercise") ||
            q.includes("routine")) {
            return "Try a beginner routine: 5 minutes of warming up, 15 minutes of walking, and 5 minutes of stretching.";
        }

        if (q.includes("water") || q.includes("hydration") ||
            q.includes("drink")) {
            return "Drink water regularly throughout the day, especially during exercise. Your needs depend on your activity and environment.";
        }

        if (q.includes("meal") || q.includes("breakfast") ||
            q.includes("lunch") || q.includes("dinner") ||
            q.includes("food")) {
            return "A balanced meal idea is rice with vegetables and a protein source such as chicken, beans or tofu.";
        }

        if (q.includes("nutrition") || q.includes("protein") ||
            q.includes("calorie")) {
            return "Nutrition includes carbohydrates for energy, protein for growth and repair, and fats for essential body functions.";
        }

        if (q.includes("sleep") || q.includes("healthy") ||
            q.includes("lifestyle")) {
            return "Healthy habits include regular movement, balanced meals, adequate sleep and staying hydrated.";
        }

        return "I have predefined tips about meals, workouts, nutrition, hydration and healthy habits. Try asking about one of those topics!";
    }

    function addMessage(sender, text) {
        const message = document.createElement("div");
        message.className = "ai-welcome-message";

        const heading = document.createElement("h3");
        heading.textContent = sender;

        const paragraph = document.createElement("p");
        paragraph.textContent = text;

        message.append(heading, paragraph);
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function sendMessage(text) {
        const question = text.trim();
        if (!question) return;

        addMessage("You", question);
        addMessage("FitTrack Coach (Demo)", getReply(question));
    }

    // Handle the Send button and Enter key
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        sendMessage(input.value);
        input.value = "";
        input.focus();
    });

    // Make existing suggestion buttons clickable
    messages.addEventListener("click", function (event) {
        const button = event.target.closest(".suggestion");

        if (button) {
            sendMessage(button.textContent);
        }
    });

    // Reset the conversation
    newChatButton?.addEventListener("click", function () {
        messages.replaceChildren(
            ...originalMessages.map(element => element.cloneNode(true))
        );

        input.value = "";
        input.focus();
    });
})();
