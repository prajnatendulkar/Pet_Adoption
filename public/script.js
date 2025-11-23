/**
 * Pet Adoption System - Homepage Script
 * 
 * This script handles:
 * - Fetching and displaying all pets from the API
 * - Navigating to pet details page when a pet card is clicked
 */

// API Base URL - Use full URL to ensure it works regardless of how the page is served
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fetches all pets from the backend API
 */
async function fetchPets() {
    try {
        const response = await fetch(`${API_BASE_URL}/pets`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch pets');
        }
        
        const pets = await response.json();
        return pets;
    } catch (error) {
        console.error('Error fetching pets:', error);
        throw error;
    }
}

/**
 * Creates a pet card element
 * @param {Object} pet - Pet object with id, name, breed, age, description
 * @returns {HTMLElement} - Pet card element
 */
function createPetCard(pet) {
    const card = document.createElement('div');
    card.className = 'pet-card';
    card.onclick = () => {
        // Navigate to pet details page with pet ID
        window.location.href = `pet-details.html?id=${pet.id}`;
    };
    
    // Check if pet has a valid image_url
    const hasImage = pet.image_url && pet.image_url.trim() !== '' && pet.image_url !== 'placeholder.jpg';
    
    // Create image section - either img tag or placeholder
    const imageSection = hasImage 
        ? `<div class="pet-image"><img src="${pet.image_url}" alt="${pet.name}"></div>`
        : `<div class="pet-image">🐾</div>`;
    
    card.innerHTML = `
        ${imageSection}
        <div class="pet-info">
            <h3>${pet.name}</h3>
            <p class="pet-breed">${pet.breed}</p>
            <p>Age: ${pet.age} ${pet.age === 1 ? 'year' : 'years'} old</p>
        </div>
    `;
    
    return card;
}

/**
 * Displays all pets in the grid
 */
async function displayPets() {
    const petsGrid = document.getElementById('pets-grid');
    
    if (!petsGrid) {
        console.error('Pets grid element not found');
        return;
    }
    
    // Show loading state
    petsGrid.innerHTML = '<div class="loading">Loading pets...</div>';
    
    try {
        // Fetch pets from API
        const pets = await fetchPets();
        
        // Clear loading state
        petsGrid.innerHTML = '';
        
        if (pets.length === 0) {
            petsGrid.innerHTML = '<div class="loading">No pets available at the moment.</div>';
            return;
        }
        
        // Create and append pet cards
        pets.forEach(pet => {
            const petCard = createPetCard(pet);
            petsGrid.appendChild(petCard);
        });
        
    } catch (error) {
        // Show error message
        petsGrid.innerHTML = `
            <div class="loading" style="color: #e74c3c;">
                Error loading pets. Please try again later.
            </div>
        `;
    }
}

/**
 * Opens the admin modal
 */
function openAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Closes the admin modal
 */
function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('add-pet-form');
        if (form) {
            form.reset();
        }
    }
}

/**
 * Handles the add pet form submission
 * @param {Event} event - Form submit event
 */
async function handleAddPetForm(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('pet-name').value.trim(),
        breed: document.getElementById('pet-breed').value.trim(),
        age: parseInt(document.getElementById('pet-age').value, 10),
        description: document.getElementById('pet-description').value.trim(),
        image_url: document.getElementById('pet-image-url').value.trim() || null
    };
    
    // Validation
    if (!formData.name || !formData.breed || isNaN(formData.age) || formData.age < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    try {
        // Send POST request to add pet endpoint
        const response = await fetch(`${API_BASE_URL}/add-pet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add pet');
        }
        
        const result = await response.json();
        
        // Close modal and reset form
        closeAdminModal();
        
        // Refresh pet list
        await displayPets();
        
        // Show success message
        alert('Pet added successfully!');
        
    } catch (error) {
        console.error('Error adding pet:', error);
        alert('Error: ' + error.message);
    }
}

// Make functions available globally
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('admin-modal');
    if (event.target === modal) {
        closeAdminModal();
    }
}

// Initialize: Load pets when page loads and attach form handler
document.addEventListener('DOMContentLoaded', () => {
    displayPets();
    
    // Attach form submit handler
    const addPetForm = document.getElementById('add-pet-form');
    if (addPetForm) {
        addPetForm.addEventListener('submit', handleAddPetForm);
    }
});

