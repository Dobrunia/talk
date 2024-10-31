import { IUserRepository } from './IUserRepository.ts';
import mysql from 'mysql2/promise';

export class MySQLUserRepository implements IUserRepository {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async createUser(username: string, email: string, password: string): Promise<any> {
    const [result] = await this.connection.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    return result;
  }

  async getUserByEmail(email: string): Promise<any> {
    const [rows] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows;
  }

  async updateUser(id: number, username?: string, email?: string, password?: string): Promise<any> {
    const query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
    await this.connection.execute(query, [username, email, password, id]);
  }

  async deleteUser(id: number): Promise<void> {
    await this.connection.execute('DELETE FROM users WHERE id = ?', [id]);
  }
}
