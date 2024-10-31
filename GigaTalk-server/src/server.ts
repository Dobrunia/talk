import express from 'express';
import { router } from './router';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type',
  })
);

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
