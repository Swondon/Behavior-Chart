import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page">
      <h1>Our Story</h1>

      <section className="about-section">
        <img src="/behavior-chart.jpeg" alt="A colorful, well-used behavior chart" className="about-image" />
        <div className="about-text">
          <h2>It Started in an Apartment...</h2>
          <p>
            Believe it or not, this all started with a real, physical behavior chart hanging on our apartment wall. It was a simple thing, but we used it all the time. It was fun, effective, and a huge part of our daily lives.
          </p>
          <p>
            Over time, after a bit too much love, it broke. We thought it would be fun if everyone could have their own version of our chart, so I decided to build this app. Now, anyone can create, share, and enjoy their own behavior charts with friends and family!
          </p>
        </div>
      </section>

      <section className="about-section reverse">
        <img src="/ian.jpeg" alt="A photo of Ian" className="about-image profile-image" />
        <div className="about-text">
          <h2>About the Creator</h2>
          <p>
            Hi, I'm Ian! I'm the one who decided our broken behavior chart deserved a second life as a digital app. I love building fun, simple tools that bring a little more joy into people's lives. I hope you have as much fun using this app as I did making it!
          </p>
          <p>
            You can see more of my projects at <a href="https://swondon.com" target="_blank" rel="noopener noreferrer">swondon.com</a>.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
