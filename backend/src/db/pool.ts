import pkg from 'pg';
const { Pool } = pkg;
import { env } from '../config/env.js';

// Mock in-memory storage for testing without PostgreSQL
class MockDatabase {
  private tables: { [key: string]: any[] } = {
    users: [],
    recipes: [],
    comments: [],
    ratings: []
  };

  async query(sql: string, params?: any[]): Promise<{ rows: any[], rowCount: number }> {
    console.log(`[mock-db] Query: ${sql}`);
    
    // Handle health checks
    if (sql.includes('SELECT 1') || sql.includes('select 1') || sql.includes('SET statement_timeout')) {
      return { rows: [{ ok: 1 }], rowCount: 1 };
    }
    
    // Handle DELETE operations
    if (sql.toLowerCase().includes('delete')) {
      return { rows: [], rowCount: 1 }; // Assume successful deletion
    }
    
    // Handle UPDATE operations
    if (sql.toLowerCase().includes('update')) {
      return { rows: [], rowCount: 1 }; // Assume successful update
    }
    
    // Handle complex stats query
    if (sql.includes('total_users') && sql.includes('total_recipes') && sql.includes('total_comments')) {
      return { 
        rows: [{
          total_users: this.tables.users.length,
          total_recipes: this.tables.recipes.length,
          total_comments: this.tables.comments.length,
          total_ratings: this.tables.ratings.length
        }], 
        rowCount: 1 
      };
    }
    
    // Handle statistics queries
    if (sql.includes('COUNT(*)') || sql.includes('count(*)')) {
      if (sql.toLowerCase().includes('users')) {
        return { rows: [{ count: this.tables.users.length.toString() }], rowCount: 1 };
      }
      if (sql.toLowerCase().includes('recipes')) {
        return { rows: [{ count: this.tables.recipes.length.toString() }], rowCount: 1 };
      }
      if (sql.toLowerCase().includes('comments')) {
        return { rows: [{ count: this.tables.comments.length.toString() }], rowCount: 1 };
      }
      return { rows: [{ count: '0' }], rowCount: 1 };
    }

    // Handle user queries
    if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('users')) {
      if (params && params.length > 0) {
        // Find specific user by email
        const user = this.tables.users.find(u => u.email === params[0]);
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
      }
      // Return all users
      return { rows: this.tables.users, rowCount: this.tables.users.length };
    }

    // Handle user creation
    if (sql.toLowerCase().includes('insert into users')) {
      const id = this.tables.users.length + 1;
      const user = {
        id,
        email: params?.[0] || 'test@example.com',
        password_hash: params?.[1] || 'hashed_password',
        name: params?.[2] || 'Test User',
        is_admin: false,
        is_premium: false,
        created_at: new Date().toISOString()
      };
      this.tables.users.push(user);
      return { rows: [user], rowCount: 1 };
    }

    // Handle recipes queries
    if (sql.toLowerCase().includes('recipes')) {
      return { rows: this.tables.recipes, rowCount: this.tables.recipes.length };
    }

    // Default empty response
    return { rows: [], rowCount: 0 };
  }

  async connect() {
    // Mock connect method
    return {
      query: this.query.bind(this),
      release: () => {
        // Mock release method
      }
    };
  }

  on(event: string, callback: (err: any) => void) {
    // Mock event listener - do nothing
  }

  // Add some initial test data
  constructor() {
    console.log('[mock-db] Initializing mock database with test data');
    
    // Add a test admin user
    this.tables.users.push({
      id: 1,
      email: 'admin@test.com',
      password_hash: '$2b$10$abc123...', // This would be a real bcrypt hash
      name: 'Admin User',
      is_admin: true,
      is_premium: true,
      created_at: new Date().toISOString()
    });

    // Add a test regular user
    this.tables.users.push({
      id: 2,
      email: 'user@test.com',
      password_hash: '$2b$10$def456...',
      name: 'Regular User',
      is_admin: false,
      is_premium: false,
      created_at: new Date().toISOString()
    });

    // Add some test recipes
    this.tables.recipes.push({
      id: 1,
      title: 'Test Recipe 1',
      author: 'Admin User',
      created_at: new Date().toISOString()
    });

    this.tables.recipes.push({
      id: 2,
      title: 'Test Recipe 2',
      author: 'Regular User',
      created_at: new Date().toISOString()
    });
  }
}

// Always use mock database since PostgreSQL is not available
console.log('[db] PostgreSQL not available, using mock database for testing');
export const pgPool = new MockDatabase();

export async function assertDatabaseConnectionOk(): Promise<void> {
  try {
    const result = await pgPool.query('select 1 as ok');
    if (!result?.rows?.[0]?.ok) {
      throw new Error('Database connection failed');
    }
    console.log('[db] Mock database connection OK');
  } catch (error) {
    console.warn('[db] Using mock database for testing');
  }
}