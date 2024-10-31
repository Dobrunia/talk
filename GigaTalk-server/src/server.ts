import express from 'express';
import { MySQLUserRepository } from './db/MySQLUserRepository';
import { UserController } from './controllers/UserController';
import mysql from 'mysql2';

const app = express();
const port = 3000;

async function startApp() {
  const connection = mysql
    .createPool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB,
    })
    .promise();

  setInterval(() => {
    connection.query('select 1');
  }, 240000);

  const userRepository = new MySQLUserRepository(connection);
  const userController = new UserController(userRepository);

  app.post('/users', (req, res) => userController.createUser(req, res));
  app.get('/users/:email', (req, res) => userController.getUser(req, res));

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startApp();
