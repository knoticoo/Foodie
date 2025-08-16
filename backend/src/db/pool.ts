import pkg from 'pg';
const { Pool } = pkg;
import { env } from '../config/env.js';
import { jsonStorage } from './jsonStorage.js';

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
    if (sql.includes('COUNT(*)') || sql.includes('count(*)') || sql.includes('COUNT(DISTINCT')) {
      if (sql.toLowerCase().includes('users')) {
        return { rows: [{ count: this.tables.users.length.toString(), total: this.tables.users.length }], rowCount: 1 };
      }
      if (sql.toLowerCase().includes('recipes')) {
        const approvedRecipes = this.tables.recipes.filter(r => r.is_approved === true);
        return { rows: [{ count: approvedRecipes.length.toString(), total: approvedRecipes.length }], rowCount: 1 };
      }
      if (sql.toLowerCase().includes('comments')) {
        return { rows: [{ count: this.tables.comments.length.toString(), total: this.tables.comments.length }], rowCount: 1 };
      }
      return { rows: [{ count: '0', total: 0 }], rowCount: 1 };
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
      // If it's the complex recipes SELECT with JOINs and WHERE is_approved = true
      if (sql.includes('author_name') || sql.includes('average_rating') || sql.includes('is_approved')) {
        // Return approved recipes with all the expected fields
        const approvedRecipes = this.tables.recipes.filter(r => r.is_approved === true);
        return { rows: approvedRecipes, rowCount: approvedRecipes.length };
      }
      // Simple recipe query
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

    // Add some detailed test recipes that match the frontend expectations
    this.tables.recipes.push({
      id: 1,
      title: 'Klasiskais Borščs',
      description: 'Tradicionāls latviešu borščs ar bieti un gaļu',
      author_name: 'Admin User',
      author_email: 'admin@test.com',
      is_approved: true,
      average_rating: 4.5,
      rating_count: 12,
      favorite_count: 8,
      comment_count: 5,
      servings: 4,
      prep_time_minutes: 30,
      cook_time_minutes: 90,
      total_time_minutes: 120,
      difficulty: 'medium',
      category: 'dinner',
      cost_cents: 650,
      cover_image: '/images/borscht.jpg',
      images: ['/images/borscht.jpg'],
      ingredients: [
        {name: 'bietes', quantity: 500, unit: 'g'},
        {name: 'gaļa', quantity: 300, unit: 'g'},
        {name: 'kāposti', quantity: 200, unit: 'g'},
        {name: 'burkāni', quantity: 150, unit: 'g'}
      ],
      steps: [
        {step: 1, text: 'Nomizojiet un sarīvējiet bietes'},
        {step: 2, text: 'Uzvāriet gaļu ar garšvielām'},
        {step: 3, text: 'Pievienojiet dārzeņus un vāriet 1 stundu'}
      ],
      diet: ['traditional'],
      nutrition: {calories: 280, protein_g: 18, carbs_g: 25, fat_g: 12},
      created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
      user_id: 1,
      is_premium_only: false
    });

    this.tables.recipes.push({
      id: 2,
      title: 'Veģetārā Quinoa Bļoda',
      description: 'Veselīga un barojoša quinoa bļoda ar dārzeņiem',
      author_name: 'Regular User',
      author_email: 'user@test.com',
      is_approved: true,
      average_rating: 4.8,
      rating_count: 25,
      favorite_count: 18,
      comment_count: 12,
      servings: 2,
      prep_time_minutes: 15,
      cook_time_minutes: 25,
      total_time_minutes: 40,
      difficulty: 'easy',
      category: 'lunch',
      cost_cents: 450,
      cover_image: '/images/quinoa-bowl.jpg',
      images: ['/images/quinoa-bowl.jpg'],
      ingredients: [
        {name: 'quinoa', quantity: 200, unit: 'g'},
        {name: 'avokado', quantity: 1, unit: 'gab'},
        {name: 'tomāti', quantity: 2, unit: 'gab'},
        {name: 'gurķi', quantity: 1, unit: 'gab'}
      ],
      steps: [
        {step: 1, text: 'Izvāriet quinoa pēc instrukcijas'},
        {step: 2, text: 'Sagrieziet dārzeņus'},
        {step: 3, text: 'Sajauciet visas sastāvdaļas bļodā'}
      ],
      diet: ['vegetarian', 'healthy'],
      nutrition: {calories: 380, protein_g: 14, carbs_g: 45, fat_g: 16},
      created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      user_id: 2,
      is_premium_only: false
    });

    this.tables.recipes.push({
      id: 3,
      title: 'Mājas Maize',
      description: 'Svaigi cepta mājas maize ar sēklām',
      author_name: 'Admin User',
      author_email: 'admin@test.com',
      is_approved: true,
      average_rating: 4.2,
      rating_count: 8,
      favorite_count: 6,
      comment_count: 3,
      servings: 8,
      prep_time_minutes: 20,
      cook_time_minutes: 45,
      total_time_minutes: 65,
      difficulty: 'medium',
      category: 'breakfast',
      cost_cents: 320,
      cover_image: '/images/homemade-bread.jpg',
      images: ['/images/homemade-bread.jpg'],
      ingredients: [
        {name: 'milti', quantity: 500, unit: 'g'},
        {name: 'raugs', quantity: 7, unit: 'g'},
        {name: 'sāls', quantity: 10, unit: 'g'},
        {name: 'ūdens', quantity: 350, unit: 'ml'}
      ],
      steps: [
        {step: 1, text: 'Samaisiet sausās sastāvdaļas'},
        {step: 2, text: 'Pievienojiet ūdeni un izmīciet mīklu'},
        {step: 3, text: 'Ļaujiet uzbriest 1 stundu'},
        {step: 4, text: 'Cepiet cepeškrāsnī 45 minūtes'}
      ],
      diet: ['traditional'],
      nutrition: {calories: 220, protein_g: 8, carbs_g: 45, fat_g: 2},
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      user_id: 1,
      is_premium_only: false
    });
  }
}

// Use JSON storage for immediate production deployment
let pgPool: any;

console.log('[db] Using JSON storage for production deployment');
pgPool = jsonStorage;

// Initialize the JSON storage
jsonStorage.init().then(() => {
  console.log('[db] JSON storage initialized successfully');
}).catch((error) => {
  console.error('[db] JSON storage initialization failed:', error);
});

export { pgPool };

export async function assertDatabaseConnectionOk(): Promise<void> {
  try {
    const result = await pgPool.query('select 1 as ok');
    if (!result?.rows?.[0]?.ok) {
      throw new Error('Database connection failed');
    }
    console.log('[db] JSON storage connection verified');
  } catch (error) {
    console.warn('[db] JSON storage connection failed:', error);
    throw error;
  }
}