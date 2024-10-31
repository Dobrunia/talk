export interface IUserRepository {
  createUser(username: string, email: string, password: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  updateUser(
    id: number,
    username?: string,
    email?: string,
    password?: string,
  ): Promise<any>;
  deleteUser(id: number): Promise<void>;
}
