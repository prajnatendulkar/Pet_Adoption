/**
 * Pet Adoption System - Database Schema
 * 
 * This file contains the SQL schema for creating the database and tables.
 * Run this script in MySQL to set up the database structure.
 */

-- Create database
CREATE DATABASE IF NOT EXISTS pet_adoption_db;
USE pet_adoption_db;

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    description TEXT,
    image_url TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create adoptions table
CREATE TABLE IF NOT EXISTS adoptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    adopter_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    adoption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Insert sample pets data
INSERT INTO pets (name, breed, age, description, status) VALUES
('Max', 'Golden Retriever', 3, 'Friendly and energetic dog. Loves playing fetch and going for walks. Great with kids and other pets.', 'available'),
('Luna', 'Siamese Cat', 2, 'Gentle and affectionate cat. Enjoys cuddling and playing with toys. Perfect for families.', 'available'),
('Buddy', 'Labrador', 5, 'Loyal and intelligent dog. Well-trained and housebroken. Great companion for active individuals.', 'available'),
('Milo', 'Persian Cat', 1, 'Playful and curious kitten. Loves exploring and climbing. Needs lots of attention and care.', 'available'),
('Charlie', 'Beagle', 4, 'Friendly and outgoing dog. Good with children and loves outdoor activities. Very social and playful.', 'available'),
('Bella', 'Maine Coon', 3, 'Large and gentle cat. Very friendly and gets along with everyone. Loves being petted and groomed.', 'available');

-- Add status column to existing pets table if it doesn't exist (for existing databases)
-- Note: If you're upgrading an existing database, run this command manually:
-- ALTER TABLE pets ADD COLUMN status VARCHAR(20) DEFAULT 'available';
-- If the column already exists, you'll get an error which you can safely ignore.

-- Add image_url column to existing pets table if it doesn't exist (for existing databases)
-- Note: If you're upgrading an existing database, run this command manually:
-- ALTER TABLE pets ADD COLUMN image_url TEXT DEFAULT NULL;
-- If the column already exists, you'll get an error which you can safely ignore.

-- Update image_url column from VARCHAR(255) to TEXT (for existing databases with VARCHAR)
-- Run this command manually if you need to change the column type:
-- ALTER TABLE pets MODIFY COLUMN image_url TEXT;
