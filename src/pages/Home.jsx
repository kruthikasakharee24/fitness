import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Home({ goTo }) {
  const [classes, setClasses] = useState([]);
  const [calories, setCalories] = useState(0);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const goal = Number(localStorage.getItem('calorieGoal')) || 2000;

  useEffect(() => {
    async function loadData() {
      const today = new Date().toLocaleDateString('en-CA');

      const { data: classData } = await supabase
        .from('classes')
        .select('*')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at')
        .limit(3);
      setClasses(classData || []);

      const { data: mealData } = await supabase
        .from('meals')
        .select('calories')
        .eq('eaten_on', today);
      let total = 0;
      (mealData || []).forEach((m) => { total = total + m.calories; });
      setCalories(total);

      const { count: exCount } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });
      setExerciseCount(exCount || 0);

      const { count: suCount } = await supabase
        .from('signups')
        .select('*', { count: 'exact', head: true });
      setSignupCount(suCount || 0);

      setLoading(false);
    }
    loadData();
  }, []);

  const remaining = goal - calories;

  return (
    <div>
      <h1>Welcome to FitLife 💪</h1>
      <p>Book classes, track your calories and explore exercises.</p>

      {/* 4 columns of stats */}
      <div className="grid cols-4">
        <div className="card stat">
          <p className="muted">Today's calories</p>
          <p className="big">{loading ? '...' : calories}</p>
        </div>
        <div className="card stat">
          <p className="muted">Calories left</p>
          <p className="big">{loading ? '...' : remaining > 0 ? remaining : 0}</p>
        </div>
        <div className="card stat">
          <p className="muted">Exercises</p>
          <p className="big">{loading ? '...' : exerciseCount}</p>
        </div>
        <div className="card stat">
          <p className="muted">Total signups</p>
          <p className="big">{loading ? '...' : signupCount}</p>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="card">
        <h3>Quick actions</h3>
        <div className="row">
          <button onClick={() => goTo('classes')}>📅 Book a class</button>
          <button className="secondary" onClick={() => goTo('calories')}>🍎 Log a meal</button>
          <button className="secondary" onClick={() => goTo('exercises')}>🏋️ Browse exercises</button>
        </div>
      </div>

      <h2>Upcoming classes</h2>
      {!loading && classes.length === 0 && <p>No upcoming classes.</p>}
      <div className="grid cols-3">
        {classes.map((c) => (
          <div className="card" key={c.id}>
            <h3>{c.title}</h3>
            <p>{c.instructor}</p>
            <p className="muted">{new Date(c.starts_at).toLocaleString()}</p>
            <button className="secondary" onClick={() => goTo('classes')}>View</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;