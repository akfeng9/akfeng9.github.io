export default function Home() {
  return (
    <div className="page page-home">
      <p className="eyebrow">Welcome to my corner of the web</p>
      <h1>Hi, I'm Annie Feng<span className="accent-dot">.</span></h1>
      <p className="lead">I build projects and conduct research at the intersection of thoughtful technology and curious questions.</p>
      <div className="home-note">Currently exploring <strong>new ideas</strong> and making useful things.</div>
      <section className="contact-section" aria-labelledby="contact-heading">
        <p className="eyebrow" id="contact-heading">Get in touch</p>
        <div className="contact-links">
          <a href="mailto:akfeng9@uw.edu">akfeng9@uw.edu</a>
          <a href="https://www.linkedin.com/in/afeng9/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </section>
    </div>
  );
}