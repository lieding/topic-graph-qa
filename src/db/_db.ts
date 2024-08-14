import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';


// for query purposes
const queryClient = postgres("postgres://postgres:@localhost:5432/postgres");
export const DB = drizzle(queryClient);
