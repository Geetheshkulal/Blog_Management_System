const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { status: response.status, ...error };
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  login: async (email, password) => {
    const data = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    return data;
  },

  logout: async () => {
    try {
      await request('/auth/logout/', { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
    }
  },

  getCurrentUser: () => request('/me/'),

  getUsers: () => request('/users/'),

  createUser: (data) =>
    request('/admin/create-user/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/posts/${query ? '?' + query : ''}`);
  },

  getPost: (slug) => request(`/posts/${slug}/`),

  createPost: (data) => {
    if (data instanceof FormData) {
      return request('/posts/', {
        method: 'POST',
        body: data,
      });
    }
    return request('/posts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePost: (slug, data) => {
    if (data instanceof FormData) {
      return request(`/posts/${slug}/`, {
        method: 'PUT',
        body: data,
      });
    }
    return request(`/posts/${slug}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePost: (slug) =>
    request(`/posts/${slug}/`, { method: 'DELETE' }),

  getComments: (slug) => request(`/comments/?post_slug=${slug}`),

  createComment: (data) =>
    request('/comments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateComment: (id, data) =>
    request(`/comments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteComment: (id) =>
    request(`/comments/${id}/`, { method: 'DELETE' }),
};
