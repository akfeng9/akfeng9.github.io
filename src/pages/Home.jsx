export default function Home() {
  return (
    <div className="page page-home">
      <div className="home-intro">
        <div className="home-intro-copy">
          <h1>Hi, I'm Annie Feng<span className="accent-dot">.</span></h1>
          <p className="lead">I use data science to uncover insights and build solutions for real-world problems.</p>
        </div>
        <div className="home-headshot-frame">
          <img
            className="home-headshot"
            src="/course-materials/headshot.png"
            alt="Annie Feng"
            loading="eager"
          />
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