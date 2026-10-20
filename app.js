const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE_NAME = path.join(__dirname,'data.json');


// Chatbot JavaScript is stored in app.js and sent to the browser.
// Predefined responses only; no external chatbot API.

const chatbotScript = String.raw`
(function () {
    "use strict";

    const form = document.getElementById("chat-form");
    const input = document.getElementById("user-input");
    const messages = document.getElementById("chat-messages");
    const newChatButton = document.getElementById("new-chat");

    if (!form || !input || !messages) return;

    const originalMessages = Array.from(
        messages.children,
        element => element.cloneNode(true)
    );

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

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        sendMessage(input.value);
        input.value = "";
        input.focus();
    });

    messages.addEventListener("click", function (event) {
        const button = event.target.closest(".suggestion");
        if (button) {
            sendMessage(button.textContent);
        }
    });

    newChatButton?.addEventListener("click", function () {
        messages.replaceChildren(
            ...originalMessages.map(element => element.cloneNode(true))
        );
        input.value = "";
        input.focus();
    });
})();
`;

// Serve the chatbot's browser code from app.js.
app.get('/chatbot.js', (req, res) => {
    res.type('application/javascript').send(chatbotScript);
});


app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function saveData(data){
    fs.writeFileSync(DATA_FILE_NAME, JSON.stringify(data, null, 2));
}

function loadData(){
    try{
        const data= JSON.parse(fs.readFileSync(DATA_FILE_NAME, 'utf-8'));
        return{workouts: data.workouts || [], meals: data.meals || [], water: data.water || {}};
    }catch (e){
        return{workouts: [], meals: [], water: {}};
    }
}

function todayStr(){
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
}
function updateMealCircle(meals){
    const MEAL_GOAL = 4;
    const today = new Date().toDateString.split("T")[0];
    const todaysMeals = meals.filter(meal => {
        return !meal.date || meal.date === today;
    });
    const mealCount = todaysMeals.length;

    const percentage = Math.min((mealCount / MEAL_GOAL)* 100,100);

    const degrees = percentage * 3.6;
    const circle = document.getElementById("meals-circle");
    const text = document.getElementById("meals-circle-value");
    circle.computedStyleMap.setProperty("--progress",`${degrees}deg`);
    text.textContent= `${mealCount}/${MEAL_GOAL}`
}

// ------------------Workouts API------------------
app.get('/api/workouts', (req, res) => {
    const data = loadData();
    res.json(data.workouts);
});

app.post('/api/workouts', (req, res) => {
    const data = loadData();
    const newWorkout = {
        id: Date.now().toString(),
        type: req.body.type || 'Other',
        durationMin: Number(req.body.durationMin) || 0,
        caloriesBurned: Number(req.body.caloriesBurned) || 0,
        date: req.body.date || todayStr()
    };
    data.workouts.push(newWorkout);
    saveData(data);
    res.status(201).json(newWorkout);
});

app.delete('/api/workouts/:id', (req, res) => {
    const data = loadData();
    data.workouts = data.workouts.filter(workout => workout.id !== req.params.id);
    saveData(data);
    res.json({ok: true});
});

//------------------Meals API------------------
app.get('/api/meals', (req, res) => {
    const data = loadData();
    res.json(data.meals);
});

app.post('/api/meals', (req, res) => {
    const data = loadData();
    const newMeal = {
        id: Date.now().toString(),
        name: req.body.name || 'Meal',
        calories: Number(req.body.calories) || 0,
        protein: Number(req.body.protein) || 0,
        carbs: Number(req.body.carbs) || 0,
        fats: Number(req.body.fats) || 0,
        date: req.body.date || todayStr()
    };
    data.meals.push(newMeal);
    saveData(data);
    res.status(201).json(newMeal);
});

app.delete('/api/meals/:id', (req, res) => {
    const data = loadData();
    data.meals = data.meals.filter(meal => meal.id !== req.params.id);
    saveData(data);
    res.json({ok: true});
});

//------------------Water API------------------
app.get('/api/water', (req, res) => {
    const data = loadData();
    res.json(data.water || {});
});
app.post('/api/water', (req, res) => {
    const data = loadData();
    const date = req.body.date || todayStr();
    const amount = Number(req.body.amount);
    if(!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({error: 'Invalid amount'});
    }
    data.water[date] = (data.water[date] || 0) + amount;
    saveData(data);
    res.status(201).json({ date, amount: data.water[date] });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
