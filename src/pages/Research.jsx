export default function Research() {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page research-page">
      <h1>Research</h1>
      <p className="lead">Questions, collaborations, and ideas worth following.</p>
      <nav className="research-cards" aria-label="Research projects">
        <button className="research-card" type="button" onClick={() => scrollToSection('constructed-circulation-analogs')}>
          <span className="research-card-number">01</span>
          <h2>Constructed Circulation Analogs Method</h2>
          <span className="research-card-link">Explore project <span aria-hidden="true">→</span></span>
        </button>
        <button className="research-card" type="button" onClick={() => scrollToSection('planetary-boundary-layer')}>
          <span className="research-card-number">02</span>
          <h2>Planetary Boundary Layer Height</h2>
          <span className="research-card-link">Explore project <span aria-hidden="true">→</span></span>
        </button>
        <button className="research-card" type="button" onClick={() => scrollToSection('diurnal-cycle')}>
          <span className="research-card-number">03</span>
          <h2>Diurnal Cycle</h2>
          <span className="research-card-link">Explore project <span aria-hidden="true">→</span></span>
        </button>
      </nav>

      <div className="research-details">
        <section id="constructed-circulation-analogs">
          <p className="eyebrow">Research project 01</p>
          <h2>Constructed Circulation Analogs Method</h2>
          <p>A space for the method, motivation, and findings behind this project.</p>
          <a className="detail-link" href="#/research/constructed-circulation-analogs">View full project <span aria-hidden="true">→</span></a>
        </section>
        <section id="planetary-boundary-layer">
          <p className="eyebrow">Research project 02</p>
          <h2>The Role of Planetary Boundary Layer Height in Ocean Surface Flux Variability</h2>
          <p>A space for project context, data, analysis, and results.</p>
          <a className="detail-link" href="#/research/planetary-boundary-layer">View full project <span aria-hidden="true">→</span></a>
        </section>
        <section id="diurnal-cycle">
          <p className="eyebrow">Research project 03</p>
          <h2>Diurnal Cycle</h2>
          <p>A space for the research question, approach, and conclusions.</p>
          <a className="detail-link" href="#/research/diurnal-cycle">View full project <span aria-hidden="true">→</span></a>
        </section>
      </div>
    </div>
  );
}