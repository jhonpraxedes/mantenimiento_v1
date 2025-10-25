import { apiJson } from './api';

export const UsuariosService = {
  authenticateUser: async (credentials: { name: string; code: string }) => {
    return await apiJson({
      path: '/users/login',
      method: 'POST',
      body: credentials,
    });
  },
  create: async (user: { code: string; name: string; role: string }) => {
    return await apiJson({
      path: '/users',
      method: 'POST',
      body: user,
    });
  },
  getUserById: async (id: any) => {
    // Implementation for fetching a user by ID
    console.info(id);
    return;
  },
  createUser: async (user: any) => {
    // Implementation for creating a new user
    console.info(user);
    return;
  },
  updateUser: async (id: any, user: any) => {
    // Implementation for updating an existing user
    console.info(user);
    return;
  },
  deleteUser: async (id: any) => {
    // Implementation for deleting a user by ID
    console.info(id);
    return;
  },
};
