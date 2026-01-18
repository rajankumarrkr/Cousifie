import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById } from '../api/courseApi';
import { enrollInCourse, checkEnrollment } from '../api/enrollmentApi';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiUser, FiClock, FiVideo, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (isAuthenticated && isStudent) {
      checkIfEnrolled();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await getCourseById(id);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfEnrolled = async () => {
    try {
      const response = await checkEnrollment(id);
      setIsEnrolled(response.data.isEnrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isStudent) {
      alert('Only students can enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      await enrollInCourse(id);
      setIsEnrolled(true);
      alert('Successfully enrolled in course!');
      navigate('/student/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const getTotalLectures = () => {
    if (!course?.sections) return 0;
    return course.sections.reduce((total, section) => total + (section.lectures?.length || 0), 0);
  };

  const getTotalDuration = () => {
    if (!course?.sections) return 0;
    let total = 0;
    course.sections.forEach(section => {
      section.lectures?.forEach(lecture => {
        total += lecture.duration || 0;
      });
    });
    return Math.floor(total / 60); // Convert to minutes
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-primary-100 hover:text-white mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Courses
          </button>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-primary-100 mb-6">{course.description}</p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <FiUser />
                  <span>{course.instructor?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiBook />
                  <span>{course.totalEnrollments || 0} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock />
                  <span>{getTotalDuration()} min</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                  {course.level}
                </span>
              </div>
            </div>

            {/* Enroll Card */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to start learning?</h3>
              
              {isEnrolled ? (
                <Link
                  to={`/learn/${id}`}
                  className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
                >
                  <FiCheckCircle />
                  <span>Continue Learning</span>
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn-primary w-full py-3"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
                </button>
              )}

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FiVideo />
                  <span>{getTotalLectures()} lectures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock />
                  <span>{getTotalDuration()} minutes of content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle />
                  <span>Full lifetime access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About Instructor */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">About the Instructor</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-2xl text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{course.instructor?.name}</h3>
                  <p className="text-gray-600">{course.instructor?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Course Content</h2>
            <div className="space-y-3">
              {course.sections?.map((section, index) => (
                <div key={section._id} className="border rounded-lg p-3">
                  <h3 className="font-semibold text-sm mb-2">
                    Section {index + 1}: {section.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {section.lectures?.length || 0} lectures
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
