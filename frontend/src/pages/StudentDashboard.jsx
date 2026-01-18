import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyEnrolledCourses } from '../api/enrollmentApi';
import { FiBook, FiClock, FiAward, FiPlay, FiTrendingUp } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await getMyEnrolledCourses();
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const totalHours = enrollments.reduce((sum, e) => {
      const sections = e.course?.sections || [];
      const minutes = sections.reduce((sectionSum, section) => {
        const lectures = section.lectures || [];
        return sectionSum + lectures.reduce((lectureSum, lecture) => lectureSum + (lecture.duration || 0), 0);
      }, 0);
      return sum + Math.floor(minutes / 3600);
    }, 0);

    return { totalCourses, completedCourses, totalHours };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
              <FiBook className="text-4xl text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Hours Learned</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalHours}</p>
              </div>
              <FiClock className="text-4xl text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
              <FiAward className="text-4xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">My Learning</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12">
              <FiBook className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No enrolled courses yet</h3>
              <p className="text-gray-600 mb-6">Browse our course catalog and start learning today!</p>
              <Link to="/courses" className="btn-primary">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{enrollment.course?.title}</h3>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                          {enrollment.course?.level}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {enrollment.course?.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-primary-600">{enrollment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FiBook />
                          <span>{enrollment.course?.category}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <FiTrendingUp />
                          <span>{enrollment.completedLectures?.length || 0} lectures completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/learn/${enrollment.course?._id}`}
                      className="ml-4 btn-primary flex items-center space-x-2"
                    >
                      <FiPlay />
                      <span>{enrollment.progress === 0 ? 'Start' : 'Continue'}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
