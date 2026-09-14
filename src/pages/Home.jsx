export default function Home() {
  return (
    <div className="page page-home">
      <p className="eyebrow">Welcome to my corner of the web</p>
      <div className="home-intro">
        <div className="home-intro-copy">
          <h1>Hi, I'm Annie Feng<span className="accent-dot">.</span></h1>
          <p className="lead">I build projects and conduct research at the intersection of thoughtful technology and curious questions.</p>
        </div>
        <div className="home-headshot-frame">
          <img className="home-headshot" src="/course-materials/headshot.jpg" alt="Annie Feng" />
        </div>
      </div>
      <div className="home-note">Currently exploring <strong>new ideas</strong> and making useful things.</div>
      <section className="contact-section" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Get in touch!</h2>
        <ul className="contact-links">
          <li>Email: <a href="mailto:akfeng9@uw.edu">akfeng9@uw.edu</a></li>
          <li>LinkedIn: <a href="https://www.linkedin.com/in/afeng9/" target="_blank" rel="noreferrer">afeng9</a></li>
        </ul>
      </section>
    </div>
  );
}