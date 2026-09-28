import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [openId, setOpenId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '', instructor: '', starts_at: '', capacity: 20,
  });
  const [msg, setMsg] = useState(null);

  function showMessage(text, isError) {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 3000);
  }

  async function loadClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('*, signups(count)')
      .order('starts_at');
    if (error) showMessage(error.message, true);
    else setClasses(data);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  async function handleSignup(e) {
    e.preventDefault();
    const { error } = await supabase.from('signups').insert({
      class_id: openId,
      member_name: name.trim(),
      member_email: email.trim(),
    });
    if (error) return showMessage(error.message, true);
    showMessage('🎉 You are signed up!');
    setOpenId(null);
    setName('');
    setEmail('');
    loadClasses();
  }

  async function handleAddClass(e) {
    e.preventDefault();
    const { error } = await supabase.from('classes').insert({
      title: newClass.title.trim(),
      instructor: newClass.instructor.trim(),
      starts_at: new Date(newClass.starts_at).toISOString(),
      capacity: Number(newClass.capacity),
    });
    if (error) return showMessage(error.message, true);
    showMessage('✅ Class added!');
    setNewClass({ title: '', instructor: '', starts_at: '', capacity: 20 });
    setShowAdd(false);
    loadClasses();
  }

  // search + sort
  let shown = classes.filter((c) => {
    const text = (c.title + ' ' + c.instructor).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  shown = [...shown].sort((a, b) => {
    if (sortBy === 'spots') {
      const leftA = a.capacity - (a.signups[0] ? a.signups[0].count : 0);
      const leftB = b.capacity - (b.signups[0] ? b.signups[0].count : 0);
      return leftB - leftA;
    }
    return new Date(a.starts_at) - new Date(b.starts_at);
  });

  return (
    <div>
      <h1>Classes</h1>

      {msg && <div className={msg.isError ? 'toast error' : 'toast'}>{msg.text}</div>}

      {/* Search and sort */}
      <div className="card">
        <div className="row">
          <input
            placeholder="🔍 Search by class or instructor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort: soonest first</option>
            <option value="spots">Sort: most spots left</option>
          </select>
          <button className="secondary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Close form' : '+ Add class'}
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAddClass}>
            <div className="form-grid">
              <div>
                <label>Class title</label>
                <input required value={newClass.title}
                  onChange={(e) => setNewClass({ ...newClass, title: e.target.value })} />
              </div>
              <div>
                <label>Instructor</label>
                <input required value={newClass.instructor}
                  onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })} />
              </div>
              <div>
                <label>Date and time</label>
                <input required type="datetime-local" value={newClass.starts_at}
                  onChange={(e) => setNewClass({ ...newClass, starts_at: e.target.value })} />
              </div>
              <div>
                <label>Capacity</label>
                <input required type="number" min="1" value={newClass.capacity}
                  onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })} />
              </div>
            </div>
            <button type="submit">Save class</button>
          </form>
        )}
      </div>

      {shown.length === 0 && <p style={{ color: '#fff' }}>No classes found.</p>}

      {/* Class cards in columns */}
      <div className="grid cols-2">
        {shown.map((c) => {
          const booked = c.signups[0] ? c.signups[0].count : 0;
          const left = c.capacity - booked;
          const full = left <= 0;

          return (
            <div className="card" key={c.id}>
              <div className="row spread">
                <h3 style={{ margin: 0 }}>{c.title}</h3>
                <span className="badge">{full ? 'Full' : left + ' left'}</span>
              </div>
              <p>👤 {c.instructor}</p>
              <p className="muted">🕒 {new Date(c.starts_at).toLocaleString()}</p>
              <div className="bar">
                <div className={full ? 'fill over' : 'fill'}
                  style={{ width: Math.min((booked / c.capacity) * 100, 100) + '%' }}></div>
              </div>
              <p className="muted">{booked} / {c.capacity} booked</p>

              {openId === c.id ? (
                <form onSubmit={handleSignup}>
                  <div className="form-grid">
                    <div className="full">
                      <label>Your name</label>
                      <input required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="full">
                      <label>Your email</label>
                      <input required type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="row">
                    <button type="submit">Confirm</button>
                    <button type="button" className="danger" onClick={() => setOpenId(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button disabled={full} onClick={() => setOpenId(c.id)}>
                  {full ? 'Class full' : 'Sign up'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Classes;