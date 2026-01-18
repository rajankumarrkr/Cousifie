import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyCourses } from '../api/courseApi';
import { FiBook, FiPlus, FiUsers, FiEdit, FiEye } from 'react-icons/fi';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getMyCourses();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      unpublished: 'bg-yellow-100 text-yellow-700',
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
            <p className="text-gray-600 mt-2">Manage your courses and track student progress</p>
          </div>
          <Link to="/instructor/courses/create" className="btn-primary flex items-center space-x-2">
            <FiPlus />
            <span>Create New Course</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <FiBook className="text-4xl text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.reduce((sum, course) => sum + (course.totalEnrollments || 0), 0)}
                </p>
              </div>
              <FiUsers className="text-4xl text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Published</p>
                <p className="text-3xl font-bold text-gray-900">
                  {courses.filter(c => c.status === 'published').length}
                </p>
              </div>
              <FiEye className="text-4xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">My Courses</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <FiBook className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Create your first course and start teaching!</p>
              <Link to="/instructor/courses/create" className="btn-primary">
                Create New Course
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                        <span>•</span>
                        <span>{course.sections?.length || 0} sections</span>
                        <span>•</span>
                        <span>{course.totalEnrollments || 0} students</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={`/instructor/courses/${course._id}/build`}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Edit Course"
                      >
                        <FiEdit className="text-xl" />
                      </Link>
                    </div>
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

export default InstructorDashboard;
