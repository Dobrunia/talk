import { Router, Request, Response } from 'express';
import { User } from './models/User';

export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the API');
});

// Создание нового пользователя
router.post('/users', async (req: Request, res: Response) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
});
