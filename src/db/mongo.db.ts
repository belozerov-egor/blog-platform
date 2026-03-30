import { Collection, Db, MongoClient } from 'mongodb';
import { SETTINGS } from '../core/settings/settings';
import { Blog } from '../blogs/domain/blog';
import { Post } from '../posts/domain/post';
import { User } from '../users/domain/user';

const BLOGS_COLLECTION_NAME = 'blogs';
const POSTS_COLLECTION_NAME = 'posts';
const USERS_COLLECTION_NAME = 'users';

export let client: MongoClient;
export let blogsCollection: Collection<Blog>;
export let postsCollection: Collection<Post>;
export let usersCollection: Collection<User>;

export async function runDB(url: string): Promise<void> {
  client = new MongoClient(url);
  const db: Db = client.db(SETTINGS.DB_NAME);

  //Инициализация коллекций
  blogsCollection = db.collection<Blog>(BLOGS_COLLECTION_NAME);
  postsCollection = db.collection<Post>(POSTS_COLLECTION_NAME);
  usersCollection = db.collection<User>(USERS_COLLECTION_NAME);

  try {
    await client.connect();
    await db.command({ ping: 1 });
    console.log('✅ Connected to the database');
  } catch (e) {
    await client.close();
    throw new Error(`❌ Database not connected: ${e}`);
  }
}
