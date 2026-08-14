import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="centered-state">
      <p className="eyebrow">404</p>
      <h1>We could not find that page.</h1>
      <Link className="button button-primary" to="/">Return home</Link>
    </main>
  );
}

export default NotFoundPage;
