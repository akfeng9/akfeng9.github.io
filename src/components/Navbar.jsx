import { NavLink } from 'react-router';

export default function Navbar() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <NavLink className="site-logo" to="/">AF</NavLink>
      <div className="nav-links">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/research">Research</NavLink>
      <NavLink to="/projects">Projects</NavLink>
      <NavLink to="/coral-lytics">Coral-lytics</NavLink>
      </div>
    </nav>
  );
}