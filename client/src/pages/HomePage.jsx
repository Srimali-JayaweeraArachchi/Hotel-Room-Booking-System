import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Simple stays. Confident booking.</p>
          <h1>Find a room that feels right.</h1>
          <p className="hero-copy">
            A secure hotel booking experience for guests, with accurate room
            availability and straightforward reservation management.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/rooms">Explore rooms</Link>
            <Link
              className="button button-secondary"
              to={isAuthenticated ? '/dashboard' : '/register'}
            >
              {isAuthenticated ? 'Open dashboard' : 'Create guest account'}
            </Link>
            {!isAuthenticated && (
              <Link className="button button-secondary" to="/login">
                I already have an account
              </Link>
            )}
          </div>
        </div>
        <aside className="hero-panel" aria-label="Project status">
          <span className="status-dot" />
          <p className="panel-label">Authentication service</p>
          <strong>Secure guest access is ready</strong>
          <ul>
            <li>Encrypted passwords</li>
            <li>Protected user sessions</li>
            <li>Role-aware accounts</li>
          </ul>
        </aside>
      </section>

      <section className="feature-grid" aria-label="System benefits">
        <article>
          <span>01</span>
          <h2>Secure by design</h2>
          <p>Passwords are hashed and authenticated requests use expiring access tokens.</p>
        </article>
        <article>
          <span>02</span>
          <h2>One clear account</h2>
          <p>Your guest identity will connect bookings, payments, notifications, and reviews.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Built to grow</h2>
          <p>The layered system keeps presentation, business rules, and data access separate.</p>
        </article>
      </section>
    </main>
  );
}

export default HomePage;
