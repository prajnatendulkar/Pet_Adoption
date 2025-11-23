/**
 * Pet Adoption System - Adopted Pets Page Script
 * 
 * This script handles:
 * - Fetching and displaying all adopted pets from the API
 */

// API Base URL - Use full URL to ensure it works regardless of how the page is served
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fetches all adopted pets from the backend API
 */
async function fetchAdoptedPets() {
    try {
        const response = await fetch(`${API_BASE_URL}/adopted`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const adoptedPets = await response.json();
        return adoptedPets;
    } catch (error) {
        console.error('Error fetching adopted pets:', error);
        // If it's a network error, provide a more helpful message
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Unable to connect to server. Please make sure the server is running.');
        }
        throw error;
    }
}

/**
 * Formats date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Creates an adopted pet item element
 * @param {Object} adoption - Adoption object with pet and adopter info
 * @returns {HTMLElement} - Adopted pet item element
 */
function createAdoptedItem(adoption) {
    const item = document.createElement('div');
    item.className = 'adopted-item';
    
    item.innerHTML = `
        <div class="adopted-item-info">
            <h3>${adoption.pet_name}</h3>
            <p class="pet-breed">${adoption.breed}</p>
            <p>Age: ${adoption.age} ${adoption.age === 1 ? 'year' : 'years'} old</p>
            <p>${adoption.description || ''}</p>
        </div>
        <div class="adopted-item-info">
            <p class="adopter-name">Adopted by: ${adoption.adopter_name}</p>
            <p><strong>Email:</strong> ${adoption.email}</p>
            <p><strong>Phone:</strong> ${adoption.phone}</p>
            <p><strong>Address:</strong> ${adoption.address}</p>
            <p class="adoption-date">Adopted on: ${formatDate(adoption.adoption_date)}</p>
        </div>
    `;
    
    return item;
}

/**
 * Displays all adopted pets
 */
async function displayAdoptedPets() {
    const adoptedList = document.getElementById('adopted-pets-list');
    
    if (!adoptedList) {
        console.error('Adopted pets list element not found');
        return;
    }
    
    // Show loading state
    adoptedList.innerHTML = '<div class="loading">Loading adopted pets...</div>';
    
    try {
        // Fetch adopted pets from API
        const adoptedPets = await fetchAdoptedPets();
        
        // Clear loading state
        adoptedList.innerHTML = '';
        
        if (adoptedPets.length === 0) {
            adoptedList.innerHTML = '<div class="loading">No pets have been adopted yet.</div>';
            return;
        }
        
        // Create and append adopted pet items
        adoptedPets.forEach(adoption => {
            const adoptedItem = createAdoptedItem(adoption);
            adoptedList.appendChild(adoptedItem);
        });
        
    } catch (error) {
        // Show error message with more details
        console.error('Display error:', error);
        adoptedList.innerHTML = `
            <div class="loading" style="color: #e74c3c;">
                <p>Error loading adopted pets: ${error.message || 'Unknown error'}</p>
                <p style="font-size: 0.9rem; margin-top: 1rem;">Please check:</p>
                <ul style="text-align: left; display: inline-block; font-size: 0.9rem;">
                    <li>Server is running on port 3000</li>
                    <li>Database connection is working</li>
                    <li>Check browser console for more details</li>
                </ul>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

// Initialize: Load adopted pets when page loads
document.addEventListener('DOMContentLoaded', displayAdoptedPets);

