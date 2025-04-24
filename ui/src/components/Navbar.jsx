import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-amber-100 font-bold text-xl hover:text-amber-50">
              SideQuest
            </Link>
          </div>
          <div className="flex space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-amber-100 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-amber-100 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-amber-100 hover:bg-emerald-700 px-3 py-2 rounded-lg transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 