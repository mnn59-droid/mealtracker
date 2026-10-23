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

//------------------Edit Support------------------
let cache = { workouts: [], meals: [], water: {} };
let editing = null; // { kind, id }

const FIELDS = {
    workouts: [
        { key: 'type', label: 'Type', type: 'text' },
        { key: 'durationMin', label: 'Minutes', type: 'number' },
        { key: 'caloriesBurned', label: 'Cal burned', type: 'number' },
        { key: 'date', label: 'Date', type: 'date' }
    ],
    meals: [
        { key: 'name', label: 'Meal', type: 'text' },
        { key: 'calories', label: 'Calories', type: 'number' },
        { key: 'protein', label: 'Protein (g)', type: 'number' },
        { key: 'carbs', label: 'Carbs (g)', type: 'number' },
        { key: 'fats', label: 'Fat (g)', type: 'number' },
        { key: 'date', label: 'Date', type: 'date' }
    ]
};

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function isEditing(kind, id) {
    return editing && editing.kind === kind && editing.id === id;
}

function editRowHTML(kind, item) {
    const inputs = FIELDS[kind].map(f => {
        const extra = f.type === 'number' ? 'min="0" step="any"' : '';
        return `
            <label class="edit-field">
                <span>${f.label}</span>
                <input name="${f.key}" type="${f.type}" value="${esc(item[f.key])}" ${extra} required />
            </label>`;
    }).join('');
    return `
        <div class="edit-grid">${inputs}</div>
        <div class="edit-actions">
            <button class="btn-cancel" data-action="cancel" data-id="${esc(item.id)}">Cancel</button>
            <button class="btn-save" data-action="save" data-id="${esc(item.id)}">Save</button>
        </div>`;
}

async function saveEdit(kind, id, li) {
    const updates = {};
    for (const input of li.querySelectorAll('input[name]')) {
        if (!input.checkValidity()) { input.reportValidity(); return; }
        updates[input.name] = input.value;
    }
    const res = await fetch(`/api/${kind}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) { alert(`Save failed: ${res.status}`); return; }
    editing = null;
    refresh();
}
//------------------Load Everything------------------
async function refresh() {
    try {
        const [workouts, meals, water] = await Promise.all([
            fetch('/api/workouts').then(res => res.json()),
            fetch('/api/meals').then(res => res.json()),
            fetch('/api/water').then(res => res.json())
        ]);
        cache = { workouts, meals, water };

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
function setCircle(circleId, textId, value, goal) {
    const circle = document.getElementById(circleId);
    const text = document.getElementById(textId);

    if (!circle || !text) return;

    const percentage = Math.min((value / goal) * 100, 100);
    const degrees = percentage * 3.6;

    circle.style.setProperty('--progress', `${degrees}deg`);
    text.textContent = `${value} / ${goal}`;

}
//------------------Renderers------------------
//workout render
function renderWorkouts(workouts) {
    if (!workoutList) return;
    workoutList.innerHTML = '';
    const today = new Date().toLocaleDateString('en-CA');
    let todayWorkoutCount = 0;
    let totalCaloriesBurned = 0;
    workouts.slice().reverse().forEach(w => {
        if(w.date === today) {
            todayWorkoutCount++;
            totalCaloriesBurned += Number(w.caloriesBurned) || 0;
        }
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="tag workout-type">WORKOUT</span>
            <span class="workout-type">${w.type}</span>
            <span class="workout-duration">${w.durationMin} min</span>
            <span class="workout-calories">${w.caloriesBurned} cal</span>
            <span class="workout-date">${w.date}</span>
            <button class="btn-edit" data-action = "edit" data-id = "${esc(w.id)}">Edit</button>
            <button class="delete-workout" data-id="${w.id}">Delete</button>

        `;
        if (isEditing('workouts', w.id)) {
            li.className = 'editing';
            li.innerHTML = editRowHTML('workouts', w);
            workoutList.appendChild(li);
            return;
        }
        workoutList.appendChild(li);
    });
    setCircle('workouts-circle', 'workouts-circle-value', todayWorkoutCount, 2);
    const caloriesBurnedValue = document.getElementById('calories-burned-value');

    if (caloriesBurnedValue) {
    caloriesBurnedValue.textContent = totalCaloriesBurned;
}
}
//meal render
function renderMeals(meals) {
    if (!mealList) return;
    mealList.innerHTML = '';

    const today = new Date().toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    let todayMealCount = 0;

    meals.slice().reverse().forEach(m => {
        if(m.date === today) {
            todayMealCount++;
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
            <button class="btn-edit" data-action = "edit" data-id = "${esc(m.id)}">Edit</button>
            <button class="delete-meal" data-id="${m.id}">Delete</button>
        `;
        mealList.appendChild(li);
        if (isEditing('meals', m.id)) {
            li.className = 'editing';
            li.innerHTML = editRowHTML('meals', m);
            mealList.appendChild(li);
            return;
        }
    });

    setBar('calories-bar', totalCalories, GOALS.calories);
    setBar('protein-bar', totalProtein, GOALS.protein);
    setBar('carbs-bar', totalCarbs, GOALS.carbs);
    setBar('fats-bar', totalFats, GOALS.fats);
    setCircle('meals-circle', 'meals-circle-value', todayMealCount, 4);
    const caloriesEaten = document.getElementById('calories-eaten-value');
const caloriesCircle = document.getElementById('calories-circle');
const caloriesPercent = document.getElementById('calories-circle-percent');

const caloriePercentage = Math.min(
    (totalCalories / GOALS.calories) * 100,
    100
);

const calorieDegrees = caloriePercentage * 3.6;

if (caloriesEaten) {
    caloriesEaten.textContent = totalCalories;
}

if (caloriesCircle) {
    caloriesCircle.style.setProperty(
        '--progress',
        `${calorieDegrees}deg`
    );
}

if (caloriesPercent) {
    caloriesPercent.textContent =
        `${Math.round(caloriePercentage)}%`;
}
setCircle('meals-circle', 'meals-circle-value', todayMealCount, 4);
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

    setCircle(
        'water-circle',
        'water-circle-value',
        todayTotal,
        GOALS.water
    );}

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
//------------------Edit / Save / Cancel Buttons------------------
function rerender() {
    renderWorkouts(cache.workouts);
    renderMeals(cache.meals);
}

function wireEdit(listEl, kind) {
    listEl?.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;

        if (btn.dataset.action === 'edit') {
            editing = { kind, id };
            rerender();
        } else if (btn.dataset.action === 'cancel') {
            editing = null;
            rerender();
        } else if (btn.dataset.action === 'save') {
            await saveEdit(kind, id, btn.closest('li'));
        }
    });
}

wireEdit(workoutList, 'workouts');
wireEdit(mealList, 'meals');

//------------------Initial Load------------------
refresh();