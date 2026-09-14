import { useEffect, useState } from 'react';

const courseSections = [
  {
    id: 'machine-learning',
    label: 'Machine Learning, Deep Learning, and Data Mining',
    subsections: [
      { id: 'machine-learning-1', label: 'Course placeholder 1' },
      { id: 'machine-learning-2', label: 'Course placeholder 2' },
      { id: 'machine-learning-3', label: 'Course placeholder 3' },
    ],
  },
  {
    id: 'analysis-differential-equations',
    label: 'Analysis, Differential Equations, and Numerical Methods',
    subsections: [
      { id: 'analysis-differential-equations-1', label: 'Course placeholder 1' },
      { id: 'analysis-differential-equations-2', label: 'Course placeholder 2' },
      { id: 'analysis-differential-equations-3', label: 'Course placeholder 3' },
    ],
  },
  {
    id: 'probability-statistics',
    label: 'Probability, Statistics, and Experimental Design',
    subsections: [
      { id: 'probability-statistics-1', label: 'Course placeholder 1' },
      { id: 'probability-statistics-2', label: 'Course placeholder 2' },
      { id: 'probability-statistics-3', label: 'Course placeholder 3' },
    ],
  },
  {
    id: 'algebraic-discrete-structures',
    label: 'Algebraic & Discrete Structures',
    subsections: [
      { id: 'algebraic-discrete-structures-1', label: 'Course placeholder 1' },
      { id: 'algebraic-discrete-structures-2', label: 'Course placeholder 2' },
      { id: 'algebraic-discrete-structures-3', label: 'Course placeholder 3' },
    ],
  },
];

export default function Courses() {
  const [activeSection, setActiveSection] = useState(courseSections[0].id);

  useEffect(() => {
    const sections = document.querySelectorAll('.course-group, .course-subsection');
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
              <div className="course-navigation-group" key={section.id}>
                <button
                  className={activeSection === section.id ? 'active' : ''}
                  type="button"
                  aria-current={activeSection === section.id ? 'true' : undefined}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.label}
                </button>
                <div className="course-navigation-subsections">
                  {section.subsections.map((subsection) => (
                    <button
                      key={subsection.id}
                      className={activeSection === subsection.id ? 'active' : ''}
                      type="button"
                      aria-current={activeSection === subsection.id ? 'true' : undefined}
                      onClick={() => scrollToSection(subsection.id)}
                    >
                      {subsection.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="course-groups">
          {courseSections.map((section) => (
            <section className="course-group" id={section.id} key={section.id}>
              <h2>{section.label}</h2>
              <div className="course-subsections">
                {section.subsections.map((subsection) => (
                  <div className="course-subsection" id={subsection.id} key={subsection.id}>
                    <h3>{subsection.label}</h3>
                    <p>Details coming soon.</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}