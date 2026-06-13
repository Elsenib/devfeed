import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export function setToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function register(payload) {
  // payload: { name, email, password, role?, skills?, languages?, bio?, website? }
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function fetchPosts(limit = 20, offset = 0) {
  const response = await api.get(`/posts?limit=${limit}&offset=${offset}`);
  return response.data;
}

export async function createPost(payload) {
  const response = await api.post('/posts', payload);
  return response.data;
}

export async function fetchPostById(postId) {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
}

export async function addComment(postId, text) {
  const response = await api.post(`/posts/${postId}/comments`, { text });
  return response.data;
}

export async function toggleLike(postId) {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
}

export async function fetchProfile(userId) {
  const url = userId ? `/profile/${userId}` : '/profile';
  const response = await api.get(url);
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.patch('/profile', payload);
  return response.data;
}

export async function uploadAvatar(image) {
  const formData = new FormData();
  if (image.uri) {
    if (Platform.OS === 'web') {
      const blob = await fetch(image.uri).then((res) => res.blob());
      const fileName = image.name || `avatar-${Date.now()}.jpg`;
      formData.append('avatar', blob, fileName);
    } else {
      const fileName = image.fileName || image.name || image.uri.split('/').pop();
      formData.append('avatar', {
        uri: image.uri,
        name: fileName,
        type: image.type || 'image/jpeg',
      });
    }
  } else if (image.file) {
    formData.append('avatar', image.file);
  }

  const response = await api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function socialLogin(payload) {
  const response = await api.post('/auth/social-login', payload);
  return response.data;
}

export async function fetchConversations() {
  const response = await api.get('/conversations');
  return response.data;
}

export async function fetchConversation(conversationId) {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
}

export async function sendMessage(conversationId, text) {
  const response = await api.post(`/conversations/${conversationId}/messages`, { text });
  return response.data;
}

export async function createConversation(payload) {
  const body = {};
  if (typeof payload === 'string') {
    body.email = payload;
  } else if (payload && typeof payload === 'object') {
    if (payload.email) body.email = payload.email;
    if (payload.userId) body.userId = payload.userId;
  }
  const response = await api.post('/conversations', body);
  return response.data;
}

export async function applyToJob(postId, payload = {}) {
  const response = await api.post(`/posts/${postId}/apply`, payload);
  return response.data;
}

export async function fetchApplicationStatus(postId) {
  const response = await api.get(`/posts/${postId}/application-status`);
  return response.data;
}

export async function fetchJobApplications(postId) {
  const response = await api.get(`/posts/${postId}/applications`);
  return response.data;
}

// Posts interactions
export async function likePost(postId) {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
}

export async function unlikePost(postId) {
  const response = await api.delete(`/posts/${postId}/like`);
  return response.data;
}

export async function bookmarkPost(postId) {
  const response = await api.post(`/posts/${postId}/bookmark`);
  return response.data;
}

export async function removeBookmark(postId) {
  const response = await api.delete(`/posts/${postId}/bookmark`);
  return response.data;
}

// Export api instance for direct use
export { api };

export default {
  api,
  setToken,
  login,
  register,
  createPost,
  socialLogin,
  fetchPosts,
  fetchPostById,
  addComment,
  toggleLike,
  likePost,
  unlikePost,
  bookmarkPost,
  removeBookmark,
  fetchProfile,
  updateProfile,
  fetchConversations,
  fetchConversation,
  sendMessage,
  createConversation,
  applyToJob,
  fetchApplicationStatus,
  fetchJobApplications,
};
