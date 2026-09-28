import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function CalorieTracker() {
  const todayDate = new Date().toLocaleDateString('en-CA');

  const [date, setDate] = useState(todayDate);
  const [meals, setMeals] = useState([]);
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [filter, setFilter] = useState('All');
  const [goal, setGoal] = useState(Number(localStorage.getItem('calorieGoal')) || 2000);
  const [goalInput, setGoalInput] = useState(goal);
  const [msg, setMsg] = useState(null);

  const types = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  function showMessage(text, isError) {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 3000);
  }

  async function loadMeals() {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('eaten_on', date)
      .order('created_at');
    if (error) showMessage(error.message, true);
    else setMeals(data);
  }

  // reload whenever the selected date changes
  useEffect(() => {
    loadMeals();
  }, [date]);

  async function addMeal(e) {
    e.preventDefault();
    const { error } = await supabase.from('meals').insert({
      food_name: food.trim(),
      calories: Number(calories),
      meal_type: mealType,
      eaten_on: date,
    });
    if (error) return showMessage(error.message, true);
    showMessage('Meal added ✅');
    setFood('');
    setCalories('');
    loadMeals();
  }

  async function deleteMeal(id) {
    await supabase.from('meals').delete().eq('id', id);
    showMessage('Meal deleted');
    loadMeals();
  }

  function saveGoal(e) {
    e.preventDefault();
    const value = Number(goalInput);
    if (value < 500) return showMessage('Goal must be at least 500', true);
    setGoal(value);
    localStorage.setItem('calorieGoal', value);
    showMessage('Goal updated 🎯');
  }

  // totals
  let total = 0;
  meals.forEach((m) => { total = total + m.calories; });

  const perType = {};
  types.forEach((t) => { perType[t] = 0; });
  meals.forEach((m) => {
    perType[m.meal_type] = (perType[m.meal_type] || 0) + m.calories;
  });

  const percent = Math.min((total / goal) * 100, 100);
  const over = total > goal;

  const shown = filter === 'All' ? meals : meals.filter((m) => m.meal_type === filter);

  return (
    <div>
      <h1>Calorie Tracker</h1>

      {msg && <div className={msg.isError ? 'toast error' : 'toast'}>{msg.text}</div>}

      {/* Summary and goal in 2 columns */}
      <div className="grid cols-2">
        <div className="card">
          <p className="muted">Total for {date}</p>
          <p className="big">{total} / {goal} kcal</p>
          <div className="bar">
            <div className={over ? 'fill over' : 'fill'} style={{ width: percent + '%' }}></div>
          </div>
          <p className="muted">
            {over ? `${total - goal} kcal over your goal` : `${goal - total} kcal remaining`}
          </p>
        </div>

        <form className="card" onSubmit={saveGoal}>
          <h3>Daily goal</h3>
          <label>Calories per day</label>
          <input type="number" min="500" value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)} />
          <div className="row" style={{ marginTop: '0.6rem' }}>
            <button type="submit">Save goal</button>
          </div>
        </form>
      </div>

      {/* Per meal type totals */}
      <div className="grid cols-4">
        {types.map((t) => (
          <div className="card stat" key={t}>
            <p className="muted">{t}</p>
            <p className="big">{perType[t]}</p>
          </div>
        ))}
      </div>

      {/* Add meal form */}
      <form className="card" onSubmit={addMeal}>
        <h3>Add a meal</h3>
        <div className="form-grid">
          <div>
            <label>Food</label>
            <input required placeholder="e.g. Idli" value={food}
              onChange={(e) => setFood(e.target.value)} />
          </div>
          <div>
            <label>Calories</label>
            <input required type="number" min="1" placeholder="e.g. 200" value={calories}
              onChange={(e) => setCalories(e.target.value)} />
          </div>
          <div>
            <label>Meal type</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <button type="submit">Add meal</button>
      </form>

      {/* Filter buttons */}
      <div className="row">
        {['All', ...types].map((t) => (
          <button key={t} className={filter === t ? 'active' : 'secondary'}
            onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p style={{ color: '#fff' }}>Nothing logged here yet.</p>}
      <div className="grid cols-2">
        {shown.map((m) => (
          <div className="card row spread" key={m.id} style={{ marginBottom: 0 }}>
            <div>
              <b>{m.food_name}</b>
              <p className="muted" style={{ margin: 0 }}>{m.meal_type} · {m.calories} kcal</p>
            </div>
            <button className="danger" onClick={() => deleteMeal(m.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalorieTracker;