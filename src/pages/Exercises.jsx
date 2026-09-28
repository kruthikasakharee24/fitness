import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEx, setNewEx] = useState({
    name: '', muscle_group: '', difficulty: 'Beginner', description: '',
  });
  const [msg, setMsg] = useState(null);

  function showMessage(text, isError) {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 3000);
  }

  async function loadExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    if (error) showMessage(error.message, true);
    else setExercises(data);
  }

  useEffect(() => {
    loadExercises();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const { error } = await supabase.from('exercises').insert({
      name: newEx.name.trim(),
      muscle_group: newEx.muscle_group.trim(),
      difficulty: newEx.difficulty,
      description: newEx.description.trim(),
    });
    if (error) return showMessage(error.message, true);
    showMessage('✅ Exercise added!');
    setNewEx({ name: '', muscle_group: '', difficulty: 'Beginner', description: '' });
    setShowAdd(false);
    loadExercises();
  }

  // muscle group buttons
  const groups = ['All'];
  exercises.forEach((ex) => {
    if (!groups.includes(ex.muscle_group)) groups.push(ex.muscle_group);
  });

  // apply all three filters
  const shown = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscle === 'All' || ex.muscle_group === muscle;
    const matchDiff = difficulty === 'All' || ex.difficulty === difficulty;
    return matchSearch && matchMuscle && matchDiff;
  });

  return (
    <div>
      <h1>Exercises</h1>

      {msg && <div className={msg.isError ? 'toast error' : 'toast'}>{msg.text}</div>}

      <div className="card">
        <div className="row">
          <input
            placeholder="🔍 Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="All">All difficulties</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <button className="secondary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Close form' : '+ Add exercise'}
          </button>
        </div>

        <div className="row">
          {groups.map((g) => (
            <button key={g} className={muscle === g ? 'active' : 'secondary'}
              onClick={() => setMuscle(g)}>
              {g}
            </button>
          ))}
        </div>

        {showAdd && (
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div>
                <label>Exercise name</label>
                <input required value={newEx.name}
                  onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} />
              </div>
              <div>
                <label>Muscle group</label>
                <input required placeholder="e.g. Legs" value={newEx.muscle_group}
                  onChange={(e) => setNewEx({ ...newEx, muscle_group: e.target.value })} />
              </div>
              <div>
                <label>Difficulty</label>
                <select value={newEx.difficulty}
                  onChange={(e) => setNewEx({ ...newEx, difficulty: e.target.value })}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="full">
                <label>Description</label>
                <textarea rows="3" value={newEx.description}
                  onChange={(e) => setNewEx({ ...newEx, description: e.target.value })} />
              </div>
            </div>
            <button type="submit">Save exercise</button>
          </form>
        )}
      </div>

      <p style={{ color: '#fff' }}>Showing {shown.length} of {exercises.length} exercises</p>
      {shown.length === 0 && <p style={{ color: '#fff' }}>No exercises match your filters.</p>}

      {/* Exercise cards in 3 columns */}
      <div className="grid cols-3">
        {shown.map((ex) => (
          <div className="card" key={ex.id}>
            <h3>{ex.name}</h3>
            <p>
              <span className="badge">{ex.muscle_group}</span>{' '}
              <span className="badge">{ex.difficulty}</span>
            </p>

            {expandedId === ex.id && <p>{ex.description || 'No description yet.'}</p>}

            <button className="secondary"
              onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}>
              {expandedId === ex.id ? 'Hide details' : 'Show details'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Exercises;