import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById } from '../api/courseApi';
import { getCourseProgress, markLectureComplete } from '../api/enrollmentApi';
import { FiCheckCircle, FiCircle, FiArrowLeft, FiBook } from 'react-icons/fi';

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        getCourseById(courseId),
        getCourseProgress(courseId)
      ]);

      setCourse(courseRes.data.course);
      setEnrollment(progressRes.data.enrollment);

      // Auto-select first lecture
      if (courseRes.data.course.sections?.length > 0) {
        const firstSection = courseRes.data.course.sections[0];
        if (firstSection.lectures?.length > 0) {
          setSelectedLecture(firstSection.lectures[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      alert('Failed to load course. You may need to enroll first.');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (lectureId) => {
    try {
      await markLectureComplete(enrollment._id, lectureId);
      fetchCourseData(); // Refresh to update progress
    } catch (error) {
      console.error('Error marking lecture complete:', error);
      alert('Failed to mark lecture as complete');
    }
  };

  const isLectureCompleted = (lectureId) => {
    return enrollment?.completedLectures?.some(id => id === lectureId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Course not found or you're not enrolled</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center text-gray-300 hover:text-white"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-white font-semibold text-lg">{course.title}</h1>
          <div className="text-gray-300 text-sm">
            Progress: {enrollment.progress}%
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col bg-black">
          {selectedLecture ? (
            <>
              {/* Video */}
              <div className="flex-1 flex items-center justify-center bg-black">
                <div className="w-full max-w-5xl aspect-video">
                  <iframe
                    src={selectedLecture.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Lecture Info */}
              <div className="bg-gray-800 p-6 border-t border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-white text-2xl font-bold mb-2">{selectedLecture.title}</h2>
                    <p className="text-gray-400">
                      Duration: {Math.floor(selectedLecture.duration / 60)}:{String(selectedLecture.duration % 60).padStart(2, '0')} min
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkComplete(selectedLecture._id)}
                    disabled={isLectureCompleted(selectedLecture._id)}
                    className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
                      isLectureCompleted(selectedLecture._id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    <FiCheckCircle />
                    <span>{isLectureCompleted(selectedLecture._id) ? 'Completed' : 'Mark as Complete'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-400">Select a lecture to start learning</p>
            </div>
          )}
        </div>

        {/* Sidebar - Course Content */}
        <div className="w-96 bg-gray-800 overflow-y-auto border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold text-lg">Course Content</h3>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${enrollment.progress}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {enrollment.completedLectures?.length || 0} of {
                course.sections.reduce((total, s) => total + (s.lectures?.length || 0), 0)
              } lectures completed
            </p>
          </div>

          {/* Sections & Lectures */}
          <div className="p-4 space-y-4">
            {course.sections?.map((section, sectionIndex) => (
              <div key={section._id}>
                <div className="flex items-center space-x-2 mb-3">
                  <FiBook className="text-primary-400" />
                  <h4 className="text-white font-semibold">
                    Section {sectionIndex + 1}: {section.title}
                  </h4>
                </div>

                <div className="space-y-2 ml-4">
                  {section.lectures?.map((lecture, lectureIndex) => (
                    <button
                      key={lecture._id}
                      onClick={() => setSelectedLecture(lecture)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedLecture?._id === lecture._id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isLectureCompleted(lecture._id) ? (
                          <FiCheckCircle className="text-green-400 flex-shrink-0" />
                        ) : (
                          <FiCircle className="text-gray-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {lectureIndex + 1}. {lecture.title}
                          </p>
                          <p className="text-xs opacity-75">
                            {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')} min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
