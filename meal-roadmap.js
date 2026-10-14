// Meal timetable builder
(function () {
    "use strict";

    // Hard-coded meal choices for each eating style.
    const mealChoices = {
        balanced: {
            label: "Balanced",
            breakfast: ["Oatmeal & banana", "Eggs & whole-grain toast", "Yogurt & berries", "Peanut butter toast", "Overnight oats"],
            lunch: ["Chicken & rice bowl", "Tuna & bean salad", "Lentil soup & bread", "Turkey & avocado wrap", "Tofu & vegetable stir-fry"],
            dinner: ["Salmon & roasted potatoes", "Chicken & vegetable pasta", "Bean chili & rice", "Roasted vegetable bowl", "Turkey meatballs & couscous"]
        },
        vegetarian: {
            label: "Vegetarian",
            breakfast: ["Overnight oats & berries", "Eggs & spinach toast", "Greek yogurt & fruit", "Peanut butter banana toast", "Chia pudding"],
            lunch: ["Chickpea & avocado wrap", "Lentil & vegetable soup", "Tofu & rice bowl", "Hummus & veggie sandwich", "Bean burrito bowl"],
            dinner: ["Vegetable & tofu curry", "Spinach & ricotta pasta", "Black bean chili", "Chickpea stir-fry", "Lentil shepherd's pie"]
        },
        highProtein: {
            label: "High protein",
            breakfast: ["Greek yogurt & seeds", "Eggs & cottage cheese", "Tofu scramble", "Protein oatmeal", "Cottage cheese & fruit"],
            lunch: ["Chicken & quinoa bowl", "Lentil & tofu salad", "Tuna & whole-grain wrap", "Turkey & bean chili", "Tempeh & rice bowl"],
            dinner: ["Grilled fish & greens", "Chicken & sweet potato", "Tofu & edamame stir-fry", "Turkey meatballs & vegetables", "Bean & quinoa skillet"]
        }
    };

    const form = document.getElementById("meal-builder-form");
    const styleSelect = document.getElementById("meal-style");
    const tableBody = document.getElementById("roadmap-body");
    const details = document.getElementById("roadmap-details");
    const summary = document.getElementById("roadmap-summary");
    const note = document.getElementById("roadmap-note");
    const status = document.getElementById("meal-builder-status");
    const resetButton = document.getElementById("reset-meal-table");

    if (!form || !styleSelect || !tableBody || !details || !summary || !note || !status || !resetButton) {
        return;
    }

    // Keep the original sample rows so the Reset button restores them.
    const sampleRows = Array.from(tableBody.children, row => row.cloneNode(true));
    const sampleNote = note.textContent.trim();
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const workouts = ["20-min walk", "Strength basics", "25-min cycling", "Light stretching", "Bodyweight workout", "Outdoor activity", "Rest or gentle walk"];
    const goals = ["Balanced meals", "Eat vegetables", "Stay hydrated", "Sleep routine", "Recovery", "Meal preparation", "Review progress"];

    // Fill meal dropdowns from the selected predefined list.
    function updateMealDropdowns() {
        const plan = mealChoices[styleSelect.value];

        for (const category of ["breakfast", "lunch", "dinner"]) {
            const dropdown = document.getElementById("favorite-" + category);
            dropdown.replaceChildren();

            for (const dish of plan[category]) {
                const option = document.createElement("option");
                option.value = dish;
                option.textContent = dish;
                dropdown.appendChild(option);
            }
        }
    }

    // starting with the user's selected favorite on Monday.
    function pickDish(list, favorite, dayIndex) {
        const first = Math.max(0, list.indexOf(favorite));
        return list[(first + dayIndex) % list.length];
    }

    function renderMealCell(plan, favorites, dayIndex) {
        const cell = document.createElement("td");
        const list = document.createElement("div");
        list.className = "roadmap-meals";

        for (const category of ["breakfast", "lunch", "dinner"]) {
            const line = document.createElement("div");
            const label = document.createElement("strong");

            label.textContent =
                category[0].toUpperCase() + category.slice(1) + ": ";

            line.appendChild(label);
            line.appendChild(
                document.createTextNode(
                    pickDish(plan[category], favorites[category], dayIndex)
                )
            );

            list.appendChild(line);
        }

        cell.appendChild(list);
        return cell;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const plan = mealChoices[styleSelect.value];

        const favorites = {
            breakfast: document.getElementById("favorite-breakfast").value,
            lunch: document.getElementById("favorite-lunch").value,
            dinner: document.getElementById("favorite-dinner").value
        };

        tableBody.replaceChildren();

        days.forEach(function (day, index) {
            const row = document.createElement("tr");

            const dayCell = document.createElement("td");
            dayCell.textContent = day;
            row.appendChild(dayCell);

            row.appendChild(renderMealCell(plan, favorites, index));

            for (const text of [workouts[index], goals[index]]) {
                const cell = document.createElement("td");
                cell.textContent = text;
                row.appendChild(cell);
            }

            tableBody.appendChild(row);
        });

        details.open = true;
        summary.textContent = "View Your Weekly Meal Plan";

        note.textContent =
            "Example meal combinations based on preset choices. " +
            "Not tailored to allergies or medical needs.";

        status.textContent =
            plan.label + " table created! Your favorite meals appear " +
            "on Monday; other preset dishes rotate through the week.";
    });

    resetButton.addEventListener("click", function () {
        tableBody.replaceChildren(
            ...sampleRows.map(row => row.cloneNode(true))
        );

        summary.textContent = "View Sample Weekly Roadmap";
        note.textContent = sampleNote;

        status.textContent =
            "Sample table restored. Choose meals above " +
            "to build another timetable.";

        details.open = true;
    });

    styleSelect.addEventListener("change", updateMealDropdowns);

    updateMealDropdowns();
})();
