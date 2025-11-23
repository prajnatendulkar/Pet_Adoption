/**
 * Pet Adoption System - Main Server File
 * 
 * This file sets up the Express server and connects to MySQL database.
 * It handles all API routes for the pet adoption system.
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add cache control headers for API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// MySQL Database Connection
let db;
try {
  db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pet_adoption_db'
  });

  // Connect to database
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err.message);
      console.error('Server will continue, but database operations may fail.');
      console.error('Please check your database configuration in .env file.');
    } else {
      console.log('Connected to MySQL database successfully!');
      
      // Run database schema migrations
      runMigrations();
    }
  });
} catch (error) {
  console.error('Failed to create database connection:', error.message);
  console.error('Server will start without database connection.');
}

// ==================== DATABASE MIGRATIONS ====================

/**
 * Runs database schema migrations
 */
function runMigrations() {
  if (!db) {
    console.log('Database connection not available, skipping migrations.');
    return;
  }

  // Migration: Update image_url column from VARCHAR(255) to TEXT
  const alterImageUrlQuery = `
    ALTER TABLE pets 
    MODIFY COLUMN image_url TEXT
  `;

  db.query(alterImageUrlQuery, (err, results) => {
    if (err) {
      // Check if error is because column doesn't exist or already has correct type
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Migration: image_url column does not exist, skipping...');
      } else if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate column name')) {
        console.log('Migration: image_url column already updated, skipping...');
      } else {
        // Log other errors but don't fail - might be that column is already TEXT
        console.log('Migration: image_url column update -', err.message);
        console.log('(This is usually safe to ignore if the column is already TEXT)');
      }
    } else {
      console.log('✅ Migration successful: image_url column updated from VARCHAR(255) to TEXT');
    }
  });
}

// ==================== API ROUTES ====================

/**
 * GET /pets
 * Fetches all available pets from the database
 */
app.get('/api/pets', (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database connection not available' });
  }
  const query = "SELECT * FROM pets WHERE status = 'available' ORDER BY id ASC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching pets:', err);
      return res.status(500).json({ error: 'Failed to fetch pets' });
    }
    res.json(results);
  });
});

/**
 * GET /pets/:id
 * Fetches details of a single pet by ID
 */
app.get('/api/pets/:id', (req, res) => {
  const petId = req.params.id;
  const query = 'SELECT * FROM pets WHERE id = ?';
  
  db.query(query, [petId], (err, results) => {
    if (err) {
      console.error('Error fetching pet:', err);
      return res.status(500).json({ error: 'Failed to fetch pet details' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    res.json(results[0]);
  });
});

/**
 * POST /add-pet
 * Adds a new pet to the database
 */
app.post('/api/add-pet', (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database connection not available' });
  }
  
  const { name, breed, age, description, image_url } = req.body;
  
  // Validation
  if (!name || !breed || age === undefined || age === null) {
    return res.status(400).json({ error: 'Name, breed, and age are required' });
  }
  
  // Validate age is a valid number
  const ageNum = parseInt(age, 10);
  if (isNaN(ageNum) || ageNum < 0) {
    return res.status(400).json({ error: 'Age must be a valid non-negative number' });
  }
  
  const query = `
    INSERT INTO pets (name, breed, age, description, image_url, status)
    VALUES (?, ?, ?, ?, ?, 'available')
  `;
  
  db.query(query, [name, breed, ageNum, description || null, image_url || null], (err, results) => {
    if (err) {
      console.error('Error adding pet:', err);
      return res.status(500).json({ error: 'Failed to add pet' });
    }
    
    res.json({ 
      success: true, 
      message: 'Pet added successfully!',
      pet_id: results.insertId
    });
  });
});

/**
 * POST /adopt
 * Stores adoption form data in the database and marks pet as adopted
 */
app.post('/api/adopt', (req, res) => {
  const { pet_id, adopter_name, email, phone, address } = req.body;
  
  // Validation
  if (!pet_id || !adopter_name || !email || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Validate pet_id is a valid number
  const petIdNum = parseInt(pet_id, 10);
  if (isNaN(petIdNum) || petIdNum <= 0) {
    return res.status(400).json({ error: 'Invalid pet ID' });
  }
  
  // Start transaction: Insert adoption record and update pet status
  db.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Failed to process adoption' });
    }
    
    // First, insert adoption record
    const adoptionQuery = `
      INSERT INTO adoptions (pet_id, adopter_name, email, phone, address, adoption_date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(adoptionQuery, [petIdNum, adopter_name, email, phone, address], (err, adoptionResults) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error storing adoption:', err);
          res.status(500).json({ error: 'Failed to process adoption' });
        });
      }
      
      // Then, update pet status to 'adopted'
      const updatePetQuery = `UPDATE pets SET status = 'adopted' WHERE id = ?`;
      
      db.query(updatePetQuery, [petIdNum], (err, updateResults) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error updating pet status:', err);
            res.status(500).json({ error: 'Failed to update pet status' });
          });
        }
        
        // Commit transaction
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ error: 'Failed to complete adoption' });
            });
          }
          
          res.json({ 
            success: true, 
            message: 'Adoption request submitted successfully!',
            adoption_id: adoptionResults.insertId
          });
        });
      });
    });
  });
});

/**
 * POST /adopt-pet
 * Alternative endpoint to mark a pet as adopted (simpler version)
 */
app.post('/api/adopt-pet', (req, res) => {
  const { pet_id } = req.body;
  
  if (!pet_id) {
    return res.status(400).json({ error: 'Pet ID is required' });
  }
  
  const petIdNum = parseInt(pet_id, 10);
  if (isNaN(petIdNum) || petIdNum <= 0) {
    return res.status(400).json({ error: 'Invalid pet ID' });
  }
  
  const query = `UPDATE pets SET status = 'adopted' WHERE id = ?`;
  
  db.query(query, [petIdNum], (err, results) => {
    if (err) {
      console.error('Error updating pet status:', err);
      return res.status(500).json({ error: 'Failed to update pet status' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Pet marked as adopted successfully!'
    });
  });
});

/**
 * GET /adopted
 * Lists all adopted pets with adopter information
 */
app.get('/api/adopted', (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database connection not available' });
  }
  const query = `
    SELECT 
      a.id as adoption_id,
      a.adopter_name,
      a.email,
      a.phone,
      a.address,
      a.adoption_date,
      p.id as pet_id,
      p.name as pet_name,
      p.breed,
      p.age,
      p.description
    FROM adoptions a
    INNER JOIN pets p ON a.pet_id = p.id
    ORDER BY a.adoption_date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching adopted pets:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch adopted pets',
        details: err.message 
      });
    }
    // Return empty array if no results, not an error
    res.json(results || []);
  });
});

// Serve static files AFTER API routes (so API routes take precedence)
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

