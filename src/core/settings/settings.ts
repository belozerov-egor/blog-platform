export const SETTINGS = {
  PORT: process.env.PORT || 5003,
  MONGO_URL:
    process.env.MONGO_URL || 'mongodb://localhost:27017/blogs-platform',
  DB_NAME: process.env.DB_NAME || 'blogs-platform',
};
