import { Link } from "react-router-dom";
import Seo from "../seo/Seo.jsx";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <Seo title="Page not found" noindex />
      <h1 className="text-4xl">404</h1>
      <p className="mt-2 text-ink/60">We couldn't find that page.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
