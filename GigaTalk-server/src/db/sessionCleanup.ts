import connection from './connection.ts';
import cron from 'node-cron';
import { ResultSetHeader } from 'mysql2';

cron.schedule('0 * * * *', async () => {
  try {
    const [result] = await connection.query<ResultSetHeader>(
      'DELETE FROM active_sessions WHERE expires_at <= NOW()',
    );
    console.log(`Deleted ${result.affectedRows} expired sessions.`);
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
});

console.log('Session cleanup job scheduled to run every hour.');

// Задача для очистки устаревших пользователей-гостей
cron.schedule('0 0 * * *', async () => {
  try {
    const [result] = await connection.query<ResultSetHeader>(
      `DELETE FROM users 
       WHERE is_guest = 1 
       AND created_at <= DATE_SUB(NOW(), INTERVAL 2 DAY)`
    );

    console.log(`Deleted ${result.affectedRows} guest users older than 2 days.`);
  } catch (error) {
    console.error('Error deleting old guest users:', error);
  }
});

console.log('Guest user cleanup job scheduled to run daily at midnight.');