import api from './api';

const USERS_ENDPOINT = '/api/users';

export const getUsers = async (role = null) => {
  try {
    const params = role ? { role } : {};
    const response = await api.get(USERS_ENDPOINT, { params });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch users');
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`${USERS_ENDPOINT}/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user');
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const response = await api.put(`${USERS_ENDPOINT}/${id}`, updates);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Update failed');
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`${USERS_ENDPOINT}/${id}`);
    if (response.data.success) {
      return true;
    }
    throw new Error(response.data.message || 'Delete failed');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

