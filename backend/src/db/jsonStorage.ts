import fs from 'fs/promises'
import path from 'path'

interface Recipe {
  id: string
  title: string
  description: string
  author_name: string
  author_email: string
  user_id: number
  is_approved: boolean
  average_rating: number
  rating_count: number
  favorite_count: number
  comment_count: number
  servings: number
  prep_time_minutes: number
  cook_time_minutes: number
  total_time_minutes: number
  difficulty: string
  category: string
  cost_cents: number
  cover_image: string
  images: string[]
  ingredients: Array<{name: string, quantity: number, unit: string}>
  steps: Array<{step: number, text: string}>
  diet: string[]
  nutrition: {calories: number, protein_g: number, carbs_g: number, fat_g: number}
  created_at: string
  is_premium_only: boolean
  view_count?: number
}

interface User {
  id: number
  email: string
  password_hash: string
  name: string
  full_name: string
  is_admin: boolean
  is_premium: boolean
  created_at: string
  premium_expires_at?: string
}

interface Comment {
  id: string
  recipe_id: string
  user_id: number
  content: string
  rating?: number
  is_approved: boolean
  created_at: string
  email?: string
  recipe_title?: string
}

class JsonStorage {
  private dataDir: string
  private recipes: Recipe[] = []
  private users: User[] = []
  private comments: Comment[] = []
  private initialized = false

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data')
  }

  async init() {
    if (this.initialized) return
    
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
      await this.loadData()
      if (this.recipes.length === 0) {
        await this.seedData()
      }
      this.initialized = true
      console.log('[JSON Storage] Initialized with', this.recipes.length, 'recipes')
    } catch (error) {
      console.error('[JSON Storage] Initialization failed:', error)
      await this.seedData() // Create default data if loading fails
      this.initialized = true
    }
  }

  private async loadData() {
    try {
      const recipesData = await fs.readFile(path.join(this.dataDir, 'recipes.json'), 'utf8')
      this.recipes = JSON.parse(recipesData)
    } catch {
      this.recipes = []
    }

    try {
      const usersData = await fs.readFile(path.join(this.dataDir, 'users.json'), 'utf8')
      this.users = JSON.parse(usersData)
    } catch {
      this.users = []
    }

    try {
      const commentsData = await fs.readFile(path.join(this.dataDir, 'comments.json'), 'utf8')
      this.comments = JSON.parse(commentsData)
    } catch {
      this.comments = []
    }
  }

  private async saveData() {
    try {
      await fs.writeFile(path.join(this.dataDir, 'recipes.json'), JSON.stringify(this.recipes, null, 2))
      await fs.writeFile(path.join(this.dataDir, 'users.json'), JSON.stringify(this.users, null, 2))
      await fs.writeFile(path.join(this.dataDir, 'comments.json'), JSON.stringify(this.comments, null, 2))
    } catch (error) {
      console.error('[JSON Storage] Save failed:', error)
    }
  }

  private async seedData() {
    // Seed users
    this.users = [
      {
        id: 1,
        email: 'admin@virtuves-maksla.lv',
        password_hash: '$2b$10$rGGbr9s7kVQY0VJm0fGEaO7FbQ8B9Y9K1Q4Y9X8F7LK0FjX5R6QKS', // password: admin123
        name: 'Admin User',
        full_name: 'Sistēmas Administrators',
        is_admin: true,
        is_premium: true,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      },
      {
        id: 2,
        email: 'pavars@virtuves-maksla.lv',
        password_hash: '$2b$10$rGGbr9s7kVQY0VJm0fGEaO7FbQ8B9Y9K1Q4Y9X8F7LK0FjX5R6QKS', // password: admin123
        name: 'Māris Zvirbulis',
        full_name: 'Māris Zvirbulis',
        is_admin: false,
        is_premium: true,
        created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Seed comprehensive recipes
    this.recipes = [
      {
        id: '1',
        title: 'Tradicionālais Latviešu Borščs',
        description: 'Bagātīgs un sātīgs borščs ar bieti, gaļu un krēmu. Klasiska latviešu virtuve ar mūsdienu pieskārienu.',
        author_name: 'Māris Zvirbulis',
        author_email: 'pavars@virtuves-maksla.lv',
        user_id: 2,
        is_approved: true,
        average_rating: 4.8,
        rating_count: 24,
        favorite_count: 18,
        comment_count: 8,
        servings: 6,
        prep_time_minutes: 30,
        cook_time_minutes: 120,
        total_time_minutes: 150,
        difficulty: 'medium',
        category: 'dinner',
        cost_cents: 850,
        cover_image: '/images/borscht.jpg',
        images: ['/images/borscht.jpg', '/images/borscht-prep.jpg'],
        ingredients: [
          {name: 'bietes', quantity: 500, unit: 'g'},
          {name: 'liellopu gaļa', quantity: 400, unit: 'g'},
          {name: 'kāposti', quantity: 300, unit: 'g'},
          {name: 'burkāni', quantity: 200, unit: 'g'},
          {name: 'sīpoli', quantity: 2, unit: 'gab'},
          {name: 'ķiploki', quantity: 4, unit: 'daiviņas'},
          {name: 'lauru lapas', quantity: 3, unit: 'gab'},
          {name: 'krējums', quantity: 200, unit: 'ml'}
        ],
        steps: [
          {step: 1, text: 'Nomizojiet un sarīvējiet bietes uz rupjās rīves'},
          {step: 2, text: 'Uzvāriet gaļu aukstā ūdenī ar lauru lapām 1.5 stundas'},
          {step: 3, text: 'Sagrieziet dārzeņus un pievienojiet buljona'},
          {step: 4, text: 'Vāriet vēl 45 minūtes līdz dārzeņi mīksti'},
          {step: 5, text: 'Pievienojiet krējumu un garšojiet'}
        ],
        diet: ['traditional', 'comfort-food'],
        nutrition: {calories: 320, protein_g: 22, carbs_g: 28, fat_g: 14},
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        is_premium_only: false,
        view_count: 156
      },
      {
        id: '2',
        title: 'Veģetārā Quinoa Buddha Bļoda',
        description: 'Krāsaina un barības vērtīga bļoda ar quinoa, avokado un tahini mērci. Ideāla veselīgai uzturei.',
        author_name: 'Admin User',
        author_email: 'admin@virtuves-maksla.lv',
        user_id: 1,
        is_approved: true,
        average_rating: 4.9,
        rating_count: 32,
        favorite_count: 28,
        comment_count: 12,
        servings: 2,
        prep_time_minutes: 20,
        cook_time_minutes: 25,
        total_time_minutes: 45,
        difficulty: 'easy',
        category: 'lunch',
        cost_cents: 650,
        cover_image: '/images/buddha-bowl.jpg',
        images: ['/images/buddha-bowl.jpg', '/images/quinoa-prep.jpg'],
        ingredients: [
          {name: 'quinoa', quantity: 150, unit: 'g'},
          {name: 'avokado', quantity: 1, unit: 'gab'},
          {name: 'ķiršu tomāti', quantity: 200, unit: 'g'},
          {name: 'gurķis', quantity: 1, unit: 'gab'},
          {name: 'rūgtais salāts', quantity: 100, unit: 'g'},
          {name: 'tahini', quantity: 3, unit: 'ēd. k.'},
          {name: 'citrona sula', quantity: 2, unit: 'ēd. k.'},
          {name: 'olīveļļa', quantity: 2, unit: 'ēd. k.'}
        ],
        steps: [
          {step: 1, text: 'Izvāriet quinoa pēc iepakojuma instrukcijas'},
          {step: 2, text: 'Sagrieziet avokado, tomātus un gurķi'},
          {step: 3, text: 'Pagatavojiet tahini mērci ar citrona sulu'},
          {step: 4, text: 'Saliktiet visas sastāvdaļas bļodā'},
          {step: 5, text: 'Aplējiet ar mērci un pasniegiet'}
        ],
        diet: ['vegetarian', 'vegan', 'healthy', 'gluten-free'],
        nutrition: {calories: 420, protein_g: 16, carbs_g: 45, fat_g: 22},
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_premium_only: false,
        view_count: 89
      },
      {
        id: '3',
        title: 'Mājas Rudzu Maize ar Sēklām',
        description: 'Svaigi cepta, aromātiska rudzu maize ar saulespuķu un ķirbju sēklām. Perfekta brokastīm.',
        author_name: 'Māris Zvirbulis',
        author_email: 'pavars@virtuves-maksla.lv',
        user_id: 2,
        is_approved: true,
        average_rating: 4.6,
        rating_count: 18,
        favorite_count: 15,
        comment_count: 6,
        servings: 12,
        prep_time_minutes: 30,
        cook_time_minutes: 50,
        total_time_minutes: 80,
        difficulty: 'medium',
        category: 'breakfast',
        cost_cents: 480,
        cover_image: '/images/rye-bread.jpg',
        images: ['/images/rye-bread.jpg', '/images/bread-baking.jpg'],
        ingredients: [
          {name: 'rudzu milti', quantity: 300, unit: 'g'},
          {name: 'kviešu milti', quantity: 200, unit: 'g'},
          {name: 'sausais raugs', quantity: 7, unit: 'g'},
          {name: 'sāls', quantity: 10, unit: 'g'},
          {name: 'ūdens', quantity: 350, unit: 'ml'},
          {name: 'medus', quantity: 2, unit: 'ēd. k.'},
          {name: 'saulespuķu sēklas', quantity: 50, unit: 'g'},
          {name: 'ķirbju sēklas', quantity: 30, unit: 'g'}
        ],
        steps: [
          {step: 1, text: 'Samaisiet sausās sastāvdaļas lielā bļodā'},
          {step: 2, text: 'Pievienojiet siltu ūdeni ar medu'},
          {step: 3, text: 'Izmīciet mīklu 10 minūtes'},
          {step: 4, text: 'Ļaujiet uzbriest siltā vietā 1 stundu'},
          {step: 5, text: 'Veidojiet klaipu un cepiet 50 min 200°C'}
        ],
        diet: ['traditional', 'high-fiber'],
        nutrition: {calories: 180, protein_g: 6, carbs_g: 35, fat_g: 3},
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_premium_only: false,
        view_count: 67
      },
      {
        id: '4',
        title: 'Gourmet Lasis ar Dilles Mērci',
        description: 'Elegants lasis ar krēmīgu dilles mērci. Premium recepte īpašiem gadījumiem.',
        author_name: 'Admin User',
        author_email: 'admin@virtuves-maksla.lv',
        user_id: 1,
        is_approved: true,
        average_rating: 4.9,
        rating_count: 15,
        favorite_count: 22,
        comment_count: 5,
        servings: 4,
        prep_time_minutes: 15,
        cook_time_minutes: 20,
        total_time_minutes: 35,
        difficulty: 'hard',
        category: 'dinner',
        cost_cents: 1850,
        cover_image: '/images/salmon-dill.jpg',
        images: ['/images/salmon-dill.jpg', '/images/salmon-prep.jpg'],
        ingredients: [
          {name: 'lasis (fileja)', quantity: 600, unit: 'g'},
          {name: 'krējums', quantity: 200, unit: 'ml'},
          {name: 'svaigs dilles', quantity: 50, unit: 'g'},
          {name: 'baltais vīns', quantity: 100, unit: 'ml'},
          {name: 'citrona sula', quantity: 2, unit: 'ēd. k.'},
          {name: 'sviests', quantity: 30, unit: 'g'},
          {name: 'sāls', quantity: 1, unit: 't. k.'},
          {name: 'balts pipars', quantity: 1, unit: 't. k.'}
        ],
        steps: [
          {step: 1, text: 'Sagatavojiet lasi - notīriet un sagrieziet porcijās'},
          {step: 2, text: 'Uzkarsējiet pannu ar sviestu'},
          {step: 3, text: 'Apcepiet lasi no abām pusēm 3-4 minūtes'},
          {step: 4, text: 'Pagatavojiet mērci ar krējumu un dillēm'},
          {step: 5, text: 'Pasniegiet ar mērci un citronu'}
        ],
        diet: ['premium', 'high-protein', 'low-carb'],
        nutrition: {calories: 380, protein_g: 32, carbs_g: 4, fat_g: 25},
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_premium_only: true,
        view_count: 234
      },
      {
        id: '5',
        title: 'Ātrie Olu Mafini ar Siera',
        description: 'Ātri un vienkārši brokastis. Ideāli aizņemtam rītam.',
        author_name: 'Māris Zvirbulis',
        author_email: 'pavars@virtuves-maksla.lv',
        user_id: 2,
        is_approved: true,
        average_rating: 4.3,
        rating_count: 28,
        favorite_count: 12,
        comment_count: 9,
        servings: 6,
        prep_time_minutes: 10,
        cook_time_minutes: 15,
        total_time_minutes: 25,
        difficulty: 'easy',
        category: 'breakfast',
        cost_cents: 320,
        cover_image: '/images/egg-muffins.jpg',
        images: ['/images/egg-muffins.jpg'],
        ingredients: [
          {name: 'olas', quantity: 8, unit: 'gab'},
          {name: 'siers (rīvēts)', quantity: 100, unit: 'g'},
          {name: 'šķiņķis', quantity: 150, unit: 'g'},
          {name: 'piena', quantity: 50, unit: 'ml'},
          {name: 'sāls', quantity: 1, unit: 't. k.'},
          {name: 'pipars', quantity: 1, unit: 't. k.'}
        ],
        steps: [
          {step: 1, text: 'Uzkarsējiet cepeškrāsni līdz 180°C'},
          {step: 2, text: 'Saputojiet olas ar pienu'},
          {step: 3, text: 'Pievienojiet sagrieztu šķiņķi un sieru'},
          {step: 4, text: 'Ielejiet mafinu formās'},
          {step: 5, text: 'Cepiet 15 minūtes līdz zeltaini'}
        ],
        diet: ['quick', 'high-protein'],
        nutrition: {calories: 220, protein_g: 18, carbs_g: 3, fat_g: 15},
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        is_premium_only: false,
        view_count: 43
      }
    ]

    // Seed some comments
    this.comments = [
      {
        id: '1',
        recipe_id: '1',
        user_id: 1,
        content: 'Fantastisks borščs! Ģimene bija sajūsmā.',
        rating: 5,
        is_approved: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        email: 'admin@virtuves-maksla.lv',
        recipe_title: 'Tradicionālais Latviešu Borščs'
      },
      {
        id: '2',
        recipe_id: '2',
        user_id: 2,
        content: 'Veselīga un garšīga opcija pusdienu pārtraukumam!',
        rating: 5,
        is_approved: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        email: 'pavars@virtuves-maksla.lv',
        recipe_title: 'Veģetārā Quinoa Buddha Bļoda'
      }
    ]

    await this.saveData()
    console.log('[JSON Storage] Seeded with', this.recipes.length, 'recipes')
  }

  // Query methods that match PostgreSQL interface
  async query(sql: string, params: any[] = []): Promise<{ rows: any[], rowCount: number }> {
    await this.init()

    // Handle health checks
    if (sql.includes('SELECT 1') || sql.includes('select 1') || sql.includes('SET statement_timeout')) {
      return { rows: [{ ok: 1 }], rowCount: 1 }
    }

    // Handle recipe queries
    if (sql.toLowerCase().includes('from recipes')) {
      if (sql.includes('COUNT(DISTINCT r.id)')) {
        const count = this.recipes.filter(r => r.is_approved).length
        return { rows: [{ total: count }], rowCount: 1 }
      }

      // Main recipes query with JOINs
      if (sql.includes('author_name') || sql.includes('average_rating')) {
        let filteredRecipes = [...this.recipes.filter(r => r.is_approved)]

        // Apply search filter
        if (params.length > 0 && typeof params[0] === 'string') {
          const searchTerm = params[0].replace(/%/g, '').toLowerCase()
          filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.title.toLowerCase().includes(searchTerm) ||
            recipe.description.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm))
          )
        }

        // Apply sorting (default to created_at DESC)
        if (sql.includes('average_rating DESC')) {
          filteredRecipes.sort((a, b) => b.average_rating - a.average_rating)
        } else {
          filteredRecipes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }

        return { rows: filteredRecipes, rowCount: filteredRecipes.length }
      }

      return { rows: this.recipes, rowCount: this.recipes.length }
    }

    // Handle user queries
    if (sql.toLowerCase().includes('from users')) {
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ count: this.users.length.toString(), total: this.users.length }], rowCount: 1 }
      }

      if (params.length > 0) {
        const user = this.users.find(u => u.email === params[0])
        return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
      }

      return { rows: this.users, rowCount: this.users.length }
    }

    // Handle comments queries
    if (sql.toLowerCase().includes('from recipe_comments')) {
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ count: this.comments.length.toString(), total: this.comments.length }], rowCount: 1 }
      }
      return { rows: this.comments, rowCount: this.comments.length }
    }

    // Handle stats queries
    if (sql.includes('total_users') && sql.includes('total_recipes')) {
      return { 
        rows: [{
          total_users: this.users.length,
          total_recipes: this.recipes.length,
          total_comments: this.comments.length,
          total_ratings: this.recipes.reduce((sum, r) => sum + r.rating_count, 0),
          average_rating: this.recipes.reduce((sum, r) => sum + r.average_rating, 0) / this.recipes.length
        }], 
        rowCount: 1 
      }
    }

    // Default empty response
    return { rows: [], rowCount: 0 }
  }

  // Add method to create new recipes
  async addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe> {
    await this.init()
    const newRecipe: Recipe = {
      ...recipe,
      id: (this.recipes.length + 1).toString(),
      created_at: new Date().toISOString()
    }
    this.recipes.push(newRecipe)
    await this.saveData()
    return newRecipe
  }

  // Add method to update recipes
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<boolean> {
    await this.init()
    const index = this.recipes.findIndex(r => r.id === id)
    if (index === -1) return false
    
    this.recipes[index] = { ...this.recipes[index], ...updates }
    await this.saveData()
    return true
  }

  // Add method to delete recipes
  async deleteRecipe(id: string): Promise<boolean> {
    await this.init()
    const index = this.recipes.findIndex(r => r.id === id)
    if (index === -1) return false
    
    this.recipes.splice(index, 1)
    await this.saveData()
    return true
  }
}

export const jsonStorage = new JsonStorage()