import fs from 'fs';
import path from 'path';

const content = `DATABASE_URL=postgresql://postgres:DatamatexTechnology@db.cuuquwsdjxfzuwbjovhv.supabase.co:5432/postgres
PORT=5000
JWT_SECRET=securesecretkey123
`;

const filePath = path.resolve('z:/Project 5/digipost/Backend/.env');

console.log('Writing clean .env to:', filePath);

try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully wrote .env');
    
    // Verify
    const readBack = fs.readFileSync(filePath, 'utf8');
    console.log('Read verification:', readBack.length, 'bytes');
    console.log('First line:', readBack.split('\n')[0]);
} catch (err) {
    console.error('Error writing .env:', err);
}
