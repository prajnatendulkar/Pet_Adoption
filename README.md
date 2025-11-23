# Pet Adoption System

A mini Pet Adoption System built with HTML, CSS, JavaScript (frontend), Node.js with Express (backend), and MySQL (database).

## Features

- **Homepage**: Display a list of available pets with their names, breeds, and ages
- **Pet Details**: View detailed information about each pet (age, breed, description)
- **Adoption Form**: Submit adoption requests with adopter information (name, email, phone, address)
- **Adopted Pets Page**: View all pets that have been adopted along with adopter details

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla JS with Fetch API)
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Project Structure

```
dbms-petadopt/
├── server.js              # Express server and API routes
├── database.sql           # Database schema and sample data
├── package.json           # Node.js dependencies
├── .env.example           # Environment variables template
├── README.md              # This file
└── public/                # Frontend files
    ├── index.html         # Homepage
    ├── pet-details.html   # Pet details and adoption form
    ├── adopted.html       # Adopted pets page
    ├── styles.css         # Main stylesheet
    ├── script.js          # Homepage JavaScript
    ├── pet-details.js     # Pet details page JavaScript
    └── adopted.js         # Adopted pets page JavaScript
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Make sure MySQL is installed and running on your system.

2. Open MySQL command line or MySQL Workbench and run:

```bash
mysql -u root -p < database.sql
```

Or manually execute the SQL commands in `database.sql` to create the database and tables.

3. The database will be created with:
   - `pets` table: Stores pet information
   - `adoptions` table: Stores adoption records
   - Sample pet data (6 pets)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

2. Edit `.env` and update the database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pet_adoption_db
PORT=3000
```

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to:
- **Homepage**: http://localhost:3000
- **Adopted Pets**: http://localhost:3000/adopted.html

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/pets` - Fetch all available pets
- `GET /api/pets/:id` - Fetch details of a specific pet
- `POST /api/adopt` - Submit an adoption request
  - Body: `{ pet_id, adopter_name, email, phone, address }`
- `GET /api/adopted` - Fetch all adopted pets with adopter information

## Database Schema

### `pets` Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(100))
- `breed` (VARCHAR(100))
- `age` (INT)
- `description` (TEXT)
- `image_url` (VARCHAR(255))
- `created_at` (TIMESTAMP)

### `adoptions` Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `pet_id` (INT, FOREIGN KEY → pets.id)
- `adopter_name` (VARCHAR(100))
- `email` (VARCHAR(100))
- `phone` (VARCHAR(20))
- `address` (TEXT)
- `adoption_date` (TIMESTAMP)

## Features in Detail

### Homepage (`index.html`)
- Displays all available pets in a responsive grid layout
- Each pet card shows name, breed, and age
- Clicking on a pet card navigates to the pet details page

### Pet Details Page (`pet-details.html`)
- Shows complete pet information
- "Adopt" button opens an adoption form
- Form collects: name, email, phone, and address
- On submission, data is stored in the database

### Adopted Pets Page (`adopted.html`)
- Lists all pets that have been adopted
- Shows pet information and adopter details
- Displays adoption date

## Adding Pet Photos

Currently, the system uses placeholder emoji (🐾) for pet images. To add actual photos:

1. Add image files to a `public/images/` directory
2. Update the `image_url` field in the `pets` table with the image filename
3. Modify the HTML/CSS to display the actual images instead of placeholders

## Notes

- The application uses modern CSS with a gradient color scheme
- All JavaScript uses async/await and Fetch API for API calls
- The code is modular with clear comments explaining each section
- Responsive design works on desktop and mobile devices

## Troubleshooting

**Database Connection Error:**
- Verify MySQL is running
- Check database credentials in `.env` file
- Ensure the database `pet_adoption_db` exists

**Port Already in Use:**
- Change the PORT in `.env` file
- Or stop the process using port 3000

**CORS Issues:**
- The server includes CORS middleware to allow cross-origin requests

## License

ISC

