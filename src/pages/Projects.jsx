import { Link } from 'react-router';

export default function Projects() {
  return (
    <div className="page">
      <h1>Projects</h1>
      <p className="lead">Here are some of the projects I've built.</p>
      <div className="research-cards">
        <Link className="research-card" to="/coral-lytics">
          <span className="research-card-number">01 / DATA VISUALIZATION</span>
          <h2>Coral-lytics</h2>
          <span className="research-card-link">Explore the survey data <span aria-hidden="true">→</span></span>
        </Link>
      </div>
    </div>
  );
}