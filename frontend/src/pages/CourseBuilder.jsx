import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, addSection, addLecture, publishCourse, deleteSection, deleteLecture } from '../api/courseApi';
import { FiPlus, FiEdit, FiTrash2, FiVideo, FiCheckCircle, FiArrowLeft, FiBook } from 'react-icons/fi';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await getCourseById(courseId);
      console.log('Course data:', response.data.course); // Debug log
      setCourse(response.data.course);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSelectedSection(null);
    setShowSectionModal(true);
  };

  const handleAddLecture = (sectionId) => {
    console.log('Adding lecture to section:', sectionId); // Debug
    setSelectedSection(sectionId);
    setShowLectureModal(true);
  };

  const handlePublish = async () => {
    if (!course.sections || course.sections.length === 0) {
      alert('Please add at least one section with lectures before publishing');
      return;
    }

    const hasLectures = course.sections.some(section => 
      section.lectures && section.lectures.length > 0
    );

    if (!hasLectures) {
      alert('Please add at least one lecture before publishing');
      return;
    }

    if (window.confirm('Are you sure you want to publish this course?')) {
      try {
        await publishCourse(courseId);
        fetchCourse();
        alert('Course published successfully!');
      } catch (err) {
        alert('Failed to publish course');
      }
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Delete this section and all its lectures?')) {
      try {
        await deleteSection(courseId, sectionId);
        fetchCourse();
      } catch (err) {
        alert('Failed to delete section');
      }
    }
  };

  const handleDeleteLecture = async (sectionId, lectureId) => {
    if (window.confirm('Delete this lecture?')) {
      try {
        await deleteLecture(courseId, sectionId, lectureId);
        fetchCourse();
      } catch (err) {
        alert('Failed to delete lecture');
      }
    }
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

  // Check if sections exist and is an array
  const sections = Array.isArray(course.sections) ? course.sections : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2 line-clamp-2">{course.description}</p>
              <div className="flex items-center space-x-3 mt-3">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {course.level}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {course.status}
                </span>
              </div>
            </div>
            <button
              onClick={handlePublish}
              className="btn-primary flex items-center space-x-2"
              disabled={course.status === 'published'}
            >
              <FiCheckCircle />
              <span>{course.status === 'published' ? 'Published' : 'Publish Course'}</span>
            </button>
          </div>
        </div>

        {/* Curriculum */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Course Curriculum</h2>
            <button
              onClick={handleAddSection}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Section</span>
            </button>
          </div>

          {/* Debug info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p>Total Sections: {sections.length}</p>
          </div>

          {sections.length > 0 ? (
            <div className="space-y-4">
              {sections.map((section, index) => {
                // Ensure lectures is an array
                const lectures = Array.isArray(section.lectures) ? section.lectures : [];
                
                return (
                  <div key={section._id} className="border rounded-lg overflow-hidden">
                    {/* Section Header */}
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <FiBook className="text-primary-600 text-xl" />
                        <div>
                          <h3 className="font-semibold text-lg">
                            Section {index + 1}: {section.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {lectures.length} lecture{lectures.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddLecture(section._id)}
                          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-1"
                        >
                          <FiPlus />
                          <span>Add Lecture</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    {/* Lectures */}
                    <div className="bg-white">
                      {lectures.length > 0 ? (
                        <div className="divide-y">
                          {lectures.map((lecture, lectureIndex) => (
                            <div
                              key={lecture._id}
                              className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
                            >
                              <div className="flex items-center space-x-3">
                                <FiVideo className="text-gray-400" />
                                <div>
                                  <p className="font-medium">
                                    {lectureIndex + 1}. {lecture.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Duration: {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, '0')} min
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteLecture(section._id, lecture._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <FiVideo className="mx-auto text-4xl text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm mb-3">No lectures in this section yet</p>
                          <button
                            onClick={() => handleAddLecture(section._id)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            + Add First Lecture
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <FiBook className="mx-auto text-7xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No sections yet</h3>
              <p className="text-gray-600 mb-6">Start building your course curriculum by adding sections</p>
              <button onClick={handleAddSection} className="btn-primary">
                <FiPlus className="inline mr-2" />
                Add First Section
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSectionModal && (
        <SectionModal
          courseId={courseId}
          onClose={() => setShowSectionModal(false)}
          onSuccess={() => {
            fetchCourse();
            setShowSectionModal(false);
          }}
        />
      )}

      {showLectureModal && selectedSection && (
        <LectureModal
          courseId={courseId}
          sectionId={selectedSection}
          onClose={() => {
            setShowLectureModal(false);
            setSelectedSection(null);
          }}
          onSuccess={() => {
            fetchCourse();
            setShowLectureModal(false);
            setSelectedSection(null);
          }}
        />
      )}
    </div>
  );
};

// Section Modal Component
const SectionModal = ({ courseId, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Section title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addSection(courseId, { title: title.trim(), order: 1 });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add section');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add New Section</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium mb-2">Section Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to React"
            className="input-field mb-4"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lecture Modal Component
const LectureModal = ({ courseId, sectionId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    duration: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      setError('Title and video URL are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addLecture(courseId, sectionId, {
        ...formData,
        title: formData.title.trim(),
        videoUrl: formData.videoUrl.trim(),
        publicId: `coursify/videos/${Date.now()}`,
        order: 1
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecture');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Add New Lecture</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lecture Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Components"
              className="input-field"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Video URL *</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or Cloudinary URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              placeholder="300"
              className="input-field"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Example: 300 = 5 minutes</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Lecture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseBuilder;
