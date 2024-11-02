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
