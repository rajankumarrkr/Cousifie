import axios from './axios';

// Instructor APIs
export const createCourse = async (courseData) => {
  const response = await axios.post('/courses', courseData);
  return response.data;
};

export const getMyCourses = async () => {
  const response = await axios.get('/courses/instructor/my-courses');
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await axios.get(`/courses/${id}`);
  return response.data;
};

export const updateCourse = async (id, courseData) => {
  const response = await axios.put(`/courses/${id}`, courseData);
  return response.data;
};

export const publishCourse = async (id) => {
  const response = await axios.patch(`/courses/${id}/publish`);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await axios.delete(`/courses/${id}`);
  return response.data;
};

// Section APIs
export const addSection = async (courseId, sectionData) => {
  const response = await axios.post(`/courses/${courseId}/sections`, sectionData);
  return response.data;
};

export const updateSection = async (courseId, sectionId, sectionData) => {
  const response = await axios.put(`/courses/${courseId}/sections/${sectionId}`, sectionData);
  return response.data;
};

export const deleteSection = async (courseId, sectionId) => {
  const response = await axios.delete(`/courses/${courseId}/sections/${sectionId}`);
  return response.data;
};

// Lecture APIs
export const addLecture = async (courseId, sectionId, lectureData) => {
  const response = await axios.post(`/courses/${courseId}/sections/${sectionId}/lectures`, lectureData);
  return response.data;
};

export const updateLecture = async (courseId, sectionId, lectureId, lectureData) => {
  const response = await axios.put(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, lectureData);
  return response.data;
};

export const deleteLecture = async (courseId, sectionId, lectureId) => {
  const response = await axios.delete(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`);
  return response.data;
};

// Public APIs
export const getAllCourses = async (params) => {
  const response = await axios.get('/courses', { params });
  return response.data;
};
