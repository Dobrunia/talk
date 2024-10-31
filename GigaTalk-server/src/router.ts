import { Router, Request, Response } from 'express';
import { User } from './models/User';

export const router = Router();

router.get('/api', (req: Request, res: Response) => {
  res.send('Welcome to the API');
});

router.get('/api/users', (req: Request, res: Response) => {
  res.json([
    {
      id: 1,
      imageUrl: '/1.gif',
      serverName: 'Название Сервера 1',
      category: [
        {
          id: 1,
          categoryName: 'первая категория',
          channels: [
            {
              id: 1,
              channelName: 'первый войс канал',
              type: 'voice',
            },
          ],
        },
      ],
    },
  ])
})

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
