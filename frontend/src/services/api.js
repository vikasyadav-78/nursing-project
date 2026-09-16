const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    return { success: false, message: err.message };
  }
}

export const apiService = {
  // Colleges
  getColleges: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/college${query ? `?${query}` : ''}`);
  },
  getCollegeById: (id) => request(`/college/${id}`),
  compareColleges: (ids) => request(`/college/compare?ids=${Array.isArray(ids) ? ids.join(',') : ids}`),

  // Courses
  getCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/course${query ? `?${query}` : ''}`);
  },
  getCourseById: (id) => request(`/course/${id}`),

  // Exams
  getExams: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exam${query ? `?${query}` : ''}`);
  },
  getExamById: (id) => request(`/exam/${id}`),

  // Blogs
  getBlogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/blog${query ? `?${query}` : ''}`);
  },
  getBlogById: (id) => request(`/blog/${id}`),

  // Placements
  getPlacements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/placement${query ? `?${query}` : ''}`);
  },

  // Search & Filters
  search: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/search${query ? `?${query}` : ''}`);
  },
  getAutocomplete: (q) => request(`/search/autocomplete?q=${encodeURIComponent(q)}`),
  getFilters: () => request('/search/filters'),

  // Lead / Admission Submission
  submitLead: (leadData) => request('/lead', {
    method: 'POST',
    body: JSON.stringify(leadData),
  }),
};

export default apiService;
