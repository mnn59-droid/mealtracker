const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE_NAME = path.join(__dirname,'data.json');

app.use(express.json());
app.use(express.static(__dirname));

function saveData(data){
    fs.writeFileSync(DATA_FILE_NAME, JSON.stringify(data, null, 2));
}

function loadData(){
    try{
        return JSON.parse(fs.readFileSync(DATA_FILE_NAME, 'utf-8'));
    }catch (e){
        return{workouts: [], meals: [], water: {}};
    }
}
function saveData(data){
    fs.writeFileSync(DATA_FILE_NAME, JSON.stringify(data, null, 2));
}
function todayStr(){
    return new Date().toISOString().split('T')[0];
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
    const meal = {
        id: Date.now().toString(),
        name: req.body.name || 'Meal',
        calories: Number(req.body.calories) || 0,
        protein: Number(req.body.protein) || 0,
        carbs: Number(req.body.carbs) || 0,
        fats: Number(req.body.fats) || 0,
        date: req.body.date || todayStr()
    };
    data.meals.push(meal);
    saveData(data);
    res.status(201).json(meal); 
})
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
S
app.post('/api/water', (req, res) => {
    const data = loadData();
    const date = req.body.date || todayStr();
    const amount = Number(req.body.amount) || 0;
    data.water[date] = (data.water[date] || 0) + amount;
    saveData(data);
    res.status(201).json({ date, amount: data.water[date] });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});