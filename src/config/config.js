import dotenv from 'dotenv';

dotenv.config()

export default {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
}