import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import { connectDB } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
    try {
        await connectDB();
        
        const email = process.env.ADMIN_EMAIL || 'admin@example.com';
        const password = process.env.ADMIN_PASSWORD || 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name: 'Super Admin',
                email,
                password: hashedPassword,
                role: 'moderator'
            }
        });

        if (created) {
            console.log('✅ Moderator user created successfully.');
        } else {
            console.log('ℹ️ User already exists. Updating role to moderator...');
            user.role = 'moderator';
            user.password = hashedPassword; // Reset password just in case
            await user.save();
            console.log('✅ User role updated to moderator.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
