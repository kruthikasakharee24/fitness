import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="brand">💪 FitLife</span>
      <div className="links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/classes">Classes</NavLink>
        <NavLink to="/calories">Calorie Tracker</NavLink>
        <NavLink to="/exercises">Exercises</NavLink>
      </div>
    </nav>
  );
}