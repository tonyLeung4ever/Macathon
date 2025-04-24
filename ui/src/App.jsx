import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Product from './pages/Product';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-amber-50">
        {/* Navigation */}
        <nav className="bg-emerald-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/home" className="text-amber-100 font-bold text-xl hover:text-amber-50">
                  Macathon 🌿
                </Link>
              </div>
              <div className="flex space-x-4">
                <Link to="/main" className="text-amber-100 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors">
                  Home
                </Link>
                <Link to="/product" className="text-amber-100 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors">
                  Product
                </Link>
                <Link to="/about" className="text-amber-100 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors">
                  About
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/main" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 