import { NavLink } from 'react-router';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f0f0f0' }}>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/research">Research</NavLink>
      <NavLink to="/projects">Projects</NavLink>
      <NavLink to="/courses">Courses</NavLink>
    </nav>
  );
}