export default function PlanetaryBoundaryLayer() {
  return (
    <div className="page detail-page">
      <a className="back-link" href="#/research">← Back to research</a>
      <p className="eyebrow">Research project 02</p>
      <h1>The Role of Planetary Boundary Layer Height in Ocean Surface Flux Variability</h1>
      <div className="detail-project-sections">
        <section className="detail-project-section" aria-labelledby="pblh-differences-heading">
          <h2 id="pblh-differences-heading">Understanding the Differences in PBLH</h2>
          <p className="project-description-placeholder">The following files were used to process planetary boundary layer height (PBLH) data from different sources and visualize any discrepancies in key areas of interest.</p>
          <ul className="project-resource-links">
            <li><a href="/research/pblh/pbl_height.R" target="_blank" rel="noopener noreferrer">pbl_height.R</a></li>
            <li><a href="/research/pblh/pblh_comparison.ipynb" target="_blank" rel="noopener noreferrer">pblh_comparison</a></li>
            <li><a href="/research/pblh/test.R" target="_blank" rel="noopener noreferrer">test.R</a></li>
          </ul>
        </section>

        <section className="detail-project-section" aria-labelledby="coare-heading">
          <h2 id="coare-heading">COARE Algorithm</h2>
          <p className="project-description-placeholder">The COARE algorithm was used to calculate ocean surface fluxes with different PBLH data: AIRS PBLH data and ERA5 PBLH data.</p>
          <ul className="project-resource-links">
            <li><a href="/research/pblh/coare_algorithm.ipynb" target="_blank" rel="noopener noreferrer">coare_algorithm</a></li>
            <li><a href="/research/pblh/coare36vn_zrf_et.py" target="_blank" rel="noopener noreferrer">coare36vn_zrf_et.py</a></li>
          </ul>
        </section>

        <section className="detail-project-section" aria-labelledby="deliverables-heading">
          <h2 id="deliverables-heading">Final Deliverables</h2>
          <p className="project-description-placeholder">On the last day of this internship, all interns wrote a report and presented their findings at NASA Jet Propulsion Laboratory.</p>
          <ul className="project-resource-links">
            <li><a href="/research/pblh/JSIP_Final_Presentation.pdf" target="_blank" rel="noopener noreferrer">JSIP Final Presentation (PDF preview)</a></li>
            <li><a href="/research/pblh/JSIP_Final_Report.pdf" target="_blank" rel="noopener noreferrer">JSIP Final Report</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
