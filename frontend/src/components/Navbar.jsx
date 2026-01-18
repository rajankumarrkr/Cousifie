import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiBook } from 'react-icons/fi';

const Navbar = () => {
  const { isAuthenticated, user, logout, isInstructor, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FiBook className="text-primary-600 text-2xl" />
            <span className="text-2xl font-bold text-primary-600">Coursify</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/courses" className="text-gray-700 hover:text-primary-600 font-medium">
                  Browse Courses
                </Link>
                
                {isInstructor && (
                  <Link to="/instructor/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                    Dashboard
                  </Link>
                )}
                
                {isStudent && (
                  <Link to="/student/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                    My Learning
                  </Link>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FiUser className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 font-medium"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/courses" className="text-gray-700 hover:text-primary-600 font-medium">
                  Browse Courses
                </Link>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
