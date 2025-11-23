/**
 * Pet Adoption System - Pet Details Page Script
 * 
 * This script handles:
 * - Fetching and displaying pet details
 * - Showing/hiding adoption form
 * - Submitting adoption form data
 */

// API Base URL - Use full URL to ensure it works regardless of how the page is served
const API_BASE_URL = 'http://localhost:3000/api';

// Store current pet ID
let currentPetId = null;

/**
 * Gets pet ID from URL parameters
 */
function getPetIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * Fetches pet details from the backend API
 * @param {number} petId - Pet ID
 */
async function fetchPetDetails(petId) {
    try {
        const response = await fetch(`${API_BASE_URL}/pets/${petId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch pet details');
        }
        
        const pet = await response.json();
        return pet;
    } catch (error) {
        console.error('Error fetching pet details:', error);
        throw error;
    }
}

/**
 * Displays pet details on the page
 * @param {Object} pet - Pet object
 */
function displayPetDetails(pet) {
    const petDetailsSection = document.getElementById('pet-details');
    
    if (!petDetailsSection) {
        console.error('Pet details section not found');
        return;
    }
    
    // Check if pet has a valid image_url
    const hasImage = pet.image_url && pet.image_url.trim() !== '' && pet.image_url !== 'placeholder.jpg';
    
    // Create image section - either img tag or placeholder
    const imageSection = hasImage 
        ? `<div class="pet-details-image"><img src="${pet.image_url}" alt="${pet.name}"></div>`
        : `<div class="pet-details-image">🐾</div>`;
    
    petDetailsSection.innerHTML = `
        <div class="pet-details-content">
            ${imageSection}
            <div class="pet-details-info">
                <h2>${pet.name}</h2>
                <p class="pet-breed">${pet.breed}</p>
                <p class="pet-age">Age: ${pet.age} ${pet.age === 1 ? 'year' : 'years'} old</p>
                <p class="pet-description">${pet.description || 'No description available.'}</p>
                <button class="btn btn-primary" onclick="showAdoptionForm()">Adopt ${pet.name}</button>
            </div>
        </div>
    `;
}

/**
 * Shows the adoption form
 */
function showAdoptionForm() {
    const formSection = document.getElementById('adoption-form-section');
    if (!formSection) {
        console.error('Adoption form section not found');
        return;
    }
    formSection.style.display = 'block';
    
    // Scroll to form
    formSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Closes the adoption form
 */
function closeAdoptionForm() {
    const formSection = document.getElementById('adoption-form-section');
    if (formSection) {
        formSection.style.display = 'none';
    }
}

/**
 * Submits the adoption form
 * @param {Event} event - Form submit event
 */
async function submitAdoptionForm(event) {
    event.preventDefault();
    
    // Validate currentPetId is set
    if (!currentPetId || isNaN(currentPetId)) {
        alert('Error: Invalid pet ID. Please refresh the page and try again.');
        return;
    }
    
    // Get form data
    const formData = {
        pet_id: currentPetId,
        adopter_name: document.getElementById('adopter-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    try {
        // Send POST request to adoption endpoint
        const response = await fetch(`${API_BASE_URL}/adopt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit adoption request');
        }
        
        const result = await response.json();
        
        // Hide form and show success message
        const formSection = document.getElementById('adoption-form-section');
        const petDetails = document.getElementById('pet-details');
        const successMessage = document.getElementById('success-message');
        const adoptionForm = document.getElementById('adoption-form');
        
        if (formSection) formSection.style.display = 'none';
        if (petDetails) petDetails.style.display = 'none';
        if (successMessage) successMessage.style.display = 'block';
        if (adoptionForm) adoptionForm.reset();
        
    } catch (error) {
        console.error('Error submitting adoption:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * Initializes the page
 */
async function initializePage() {
    // Get pet ID from URL
    const petId = getPetIdFromURL();
    
    if (!petId) {
        document.getElementById('pet-details').innerHTML = `
            <div class="loading" style="color: #e74c3c;">
                Invalid pet ID. <a href="index.html">Return to home</a>
            </div>
        `;
        return;
    }
    
    // Validate pet ID is a valid number
    const petIdNum = parseInt(petId, 10);
    if (isNaN(petIdNum) || petIdNum <= 0) {
        document.getElementById('pet-details').innerHTML = `
            <div class="loading" style="color: #e74c3c;">
                Invalid pet ID. <a href="index.html">Return to home</a>
            </div>
        `;
        return;
    }
    
    currentPetId = petIdNum;
    
    // Show loading state
    const petDetailsSection = document.getElementById('pet-details');
    petDetailsSection.innerHTML = '<div class="loading">Loading pet details...</div>';
    
    try {
        // Fetch and display pet details
        const pet = await fetchPetDetails(petId);
        displayPetDetails(pet);
    } catch (error) {
        // Show error message
        petDetailsSection.innerHTML = `
            <div class="loading" style="color: #e74c3c;">
                Error loading pet details. <a href="index.html">Return to home</a>
            </div>
        `;
        return;
    }
    
    // Attach form submit handler
    const adoptionForm = document.getElementById('adoption-form');
    if (adoptionForm) {
        adoptionForm.addEventListener('submit', submitAdoptionForm);
    }
}

// Make functions available globally for onclick handlers
window.showAdoptionForm = showAdoptionForm;
window.closeAdoptionForm = closeAdoptionForm;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

