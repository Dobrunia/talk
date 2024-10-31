import { Request, Response } from 'express';
import { IUserRepository } from '../db/IUserRepository';

export class UserController {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(req: Request, res: Response) {
    const { username, email, password } = req.body;

    try {
      const user = await this.userRepository.createUser(username, email, password);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create user', details: err });
    }
  }

  async getUser(req: Request, res: Response) {
    const { email } = req.params;

    try {
      const user = await this.userRepository.getUserByEmail(email);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user', details: err });
    }
  }
}
