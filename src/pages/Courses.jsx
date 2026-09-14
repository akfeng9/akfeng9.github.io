import { useEffect, useState } from 'react';

const courseSections = [
  { id: 'machine-learning', label: 'Machine Learning, Deep Learning, and Data Mining' },
  { id: 'analysis-differential-equations', label: 'Analysis, Differential Equations, and Numerical Methods' },
  { id: 'probability-statistics', label: 'Probability, Statistics, and Experimental Design' },
  { id: 'algebraic-discrete-structures', label: 'Algebraic & Discrete Structures' },
];

export default function Courses() {
  const [activeSection, setActiveSection] = useState(courseSections[0].id);

  useEffect(() => {
    const sections = document.querySelectorAll('.course-group');
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visibleSection) {
          setActiveSection(visibleSection.target.id);
        }
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page courses-page">
      <h1>Courses & Teaching</h1>
      <p className="lead">Relevant coursework I've taken or classes I've served as a Teaching Assistant for.</p>

      <div className="course-layout">
        <nav className="course-navigation" aria-label="Course sections">
          <p className="eyebrow">On this page</p>
          <div className="course-navigation-links">
            {courseSections.map((section) => (
              <button
                key={section.id}
                className={activeSection === section.id ? 'active' : ''}
                type="button"
                aria-current={activeSection === section.id ? 'true' : undefined}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="course-groups">
        <section className="course-group" id="machine-learning">
          <h2>Machine Learning, Deep Learning, and Data Mining</h2>
          <div className="course-placeholders">
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
          </div>
        </section>

        <section className="course-group" id="analysis-differential-equations">
          <h2>Analysis, Differential Equations, and Numerical Methods</h2>
          <div className="course-placeholders">
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
          </div>
        </section>

        <section className="course-group" id="probability-statistics">
          <h2>Probability, Statistics, and Experimental Design</h2>
          <div className="course-placeholders">
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
          </div>
        </section>

        <section className="course-group" id="algebraic-discrete-structures">
          <h2>Algebraic &amp; Discrete Structures</h2>
          <div className="course-placeholders">
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
            <article><h3>Placeholder</h3><p>Details coming soon.</p></article>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}