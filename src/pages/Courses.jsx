import { useEffect, useState } from 'react';

const courseSections = [
  {
    id: 'machine-learning',
    label: 'Machine Learning, Deep Learning, and Data Mining',
    subsections: [
      { id: 'data-science', label: 'Data Science', slug: 'data-science' },
      { id: 'machine-learning-topic', label: 'Machine Learning', slug: 'machine-learning' },
      { id: 'data-mining', label: 'Data Mining', slug: 'data-mining' },
      { id: 'neural-networks-deep-learning', label: 'Neural Networks and Deep Learning', slug: 'neural-networks-deep-learning' },
    ],
  },
  {
    id: 'analysis-differential-equations',
    label: 'Analysis, Differential Equations, and Numerical Methods',
    subsections: [
      { id: 'analysis', label: 'Analysis', slug: 'analysis' },
      { id: 'differential-equations', label: 'Differential Equations', slug: 'differential-equations' },
      { id: 'numerical-methods', label: 'Numerical Methods', slug: 'numerical-methods' },
    ],
  },
  {
    id: 'probability-statistics',
    label: 'Probability, Statistics, and Experimental Design',
    subsections: [
      { id: 'mathematical-statistics', label: 'Mathematical Statistics', slug: 'mathematical-statistics' },
      { id: 'experimental-design', label: 'Experimental Design', slug: 'experimental-design' },
    ],
  },
  {
    id: 'algebraic-discrete-structures',
    label: 'Algebraic & Discrete Structures',
    subsections: [
      { id: 'linear-algebra', label: 'Linear Algebra', slug: 'linear-algebra' },
      { id: 'graph-theory', label: 'Graph Theory', slug: 'graph-theory' },
      { id: 'mathematical-cryptology', label: 'Mathematical Cryptology', slug: 'mathematical-cryptology' },
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
                    <p className="course-takeaways-label">Main takeaways</p>
                    <ul className="course-takeaways">
                      <li>Key ideas and techniques coming soon.</li>
                      <li>Important examples and applications coming soon.</li>
                    </ul>
                    <div className="course-resource-links">
                      <a href={`/course-materials/notes/${subsection.slug}.md`}>Notes</a>
                      <a href={`/course-materials/practice/${subsection.slug}.md`}>Practice problems</a>
                    </div>
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