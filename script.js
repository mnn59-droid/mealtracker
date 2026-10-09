const GOALS = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 70,
    water: 3000
};

const workoutList = document.getElementById('workout-list');
const mealList = document.getElementById('meal-list');
const waterList = document.getElementById('water-list');

//------------------Load Everything------------------
async function refresh() {
    try {
        const [workouts, meals, water] = await Promise.all([
            fetch('/api/workouts').then(res => res.json()),
            fetch('/api/meals').then(res => res.json()),
            fetch('/api/water').then(res => res.json())
        ]);
        renderWorkouts(workouts);
        renderMeals(meals);
        renderWater(water);
    } catch (err) {
        console.error('Failed to load data!:', err);
    }
}
//progress Bar Helper
function setBar(barId, value, goal) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    const percentage = Math.min(100, Math.round((value / goal) * 100));
    bar.style.width = percentage + '%';
    bar.textContent = `${value} / ${goal}`; 
}

//------------------Renderers------------------
//workout render
function renderWorkouts(workouts) {
    if (!workoutList) return;
    workoutList.innerHTML = '';
    workouts.slice().reverse().forEach(w => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="tag workout-type">WORKOUT</span>
            <span class="workout-type">${w.type}</span>
            <span class="workout-duration">${w.durationMin} min</span>
            <span class="workout-calories">${w.caloriesBurned} cal</span>
            <span class="workout-date">${w.date}</span>
            <button class="delete-workout" data-id="${w.id}">Delete</button>
        `;
        workoutList.appendChild(li);
    });
}
//meal render
function renderMeals(meals) {
    if (!mealList) return;
    mealList.innerHTML = '';

    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

    meals.slice().reverse().forEach(m => {
        if(m.date === today) {
            totalCalories += Number(m.calories) || 0;
            totalProtein += Number(m.protein) || 0;
            totalCarbs += Number(m.carbs) || 0;
            totalFats += Number(m.fats) || 0;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <span class="tag meal-name">MEAL</span>
            <span class="meal-name">${m.name}</span>
            <span class="meal-calories">${m.calories} cal</span>
            <span class="meal-protein">${m.protein} g</span>
            <span class="meal-carbs">${m.carbs} g</span>
            <span class="meal-fats">${m.fats} g</span>
            <span class="meal-date">${m.date}</span>
            <button class="delete-meal" data-id="${m.id}">Delete</button>
        `;
        mealList.appendChild(li);
    });

    setBar('calories-bar', totalCalories, GOALS.calories);
    setBar('protein-bar', totalProtein, GOALS.protein);
    setBar('carbs-bar', totalCarbs, GOALS.carbs);
    setBar('fats-bar', totalFats, GOALS.fats);
}
//water render
function renderWater(waterData) {
    if (!waterList) return;
    waterList.innerHTML = '';

    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    const todayTotal = waterData[today] || 0;

    // Display water log by date
    Object.entries(waterData).reverse().forEach(([date, amount]) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="tag water-amount">WATER</span>
            <span class="water-date">${date}</span>
            <span class="water-ml">${amount} ml</span>
        `;
        waterList.appendChild(li);
    });

    setBar('water-bar', todayTotal, GOALS.water);
}

//------------------Forms------------------
document.getElementById('workout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        type: formData.get('type'),
        durationMin: formData.get('durationMin'),
        caloriesBurned: formData.get('caloriesBurned'),
        date: formData.get('date')
    };

    await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    e.target.reset();
    refresh();
});

document.getElementById('meal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("MEAL FORM SUBMITTED");

    const formData = new FormData(e.target);

    const data = {
        name: formData.get('name'),
        calories: formData.get('calories'),
        protein: formData.get('protein'),
        carbs: formData.get('carbs'),
        fats: formData.get('fats'),
        date: formData.get('date')
    };

    console.log("Sending:", data);

    const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    console.log("Server response:", response.status);

    if (!response.ok) {
        console.error("Meal failed to save");
        return;
    }

    const savedMeal = await response.json();

    console.log("Saved meal:", savedMeal);

    e.target.reset();

    refresh();
});
document.getElementById('water-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        amount: formData.get('amount'),
        date: formData.get('date')
    };

    await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    e.target.reset();
    refresh();
});

//------------------Delegated Delete Listeners------------------
workoutList?.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-workout')) {
        const id = e.target.getAttribute('data-id');
        await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
        refresh();
    }
});

mealList?.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-meal')) {
        const id = e.target.getAttribute('data-id');
        await fetch(`/api/meals/${id}`, { method: 'DELETE' });
        refresh();
    }
});

//------------------Initial Load------------------
refresh();