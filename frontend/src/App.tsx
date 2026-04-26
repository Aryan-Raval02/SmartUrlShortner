import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Future Phase Routes */}
          <Route path="/login" element={<div className="p-20 text-center">Login Page Placeholder</div>} />
          <Route path="/register" element={<div className="p-20 text-center">Register Page Placeholder</div>} />
          <Route path="*" element={<div className="p-20 text-center text-4xl font-bold">404 - Page Not Found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
