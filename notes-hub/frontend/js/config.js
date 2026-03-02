// Notes Hub Frontend Configuration
const CONFIG = {
    // Backend API URL
    API_BASE_URL: 'http://localhost:3001',
    
    // API Endpoints
    API: {
        // Health
        HEALTH: '/api/health',
        
        // Authentication
        STUDENT_REGISTER: '/api/student/register',
        STUDENT_LOGIN: '/api/student/login',
        STUDENT_LOGOUT: '/api/student/logout',
        CHECK_AUTH: '/api/student/check-auth',
        STUDENT_PROFILE: '/api/student/profile',
        
        // Categories
        CATEGORIES: '/api/notes/categories',
        
        // Notes
        NOTES_UPLOAD: '/api/notes/upload',
        NOTES_BY_CATEGORY: '/api/notes/category',
        NOTES_SEARCH: '/api/notes/search',
        NOTE_DETAILS: '/api/notes',
        STUDENT_NOTES: '/api/student',
        NOTE_DOWNLOAD: '/api/notes',
        
        // Reviews
        ADD_REVIEW: '/api/notes'
    },
    
    // File Upload Settings
    UPLOAD: {
        MAX_SIZE: 20 * 1024 * 1024, // 20MB
        ALLOWED_TYPES: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ALLOWED_EXTENSIONS: ['.pdf', '.txt', '.doc', '.docx']
    },
    
    // UI Settings
    UI: {
        ITEMS_PER_PAGE: 12,
        SEARCH_DEBOUNCE: 300,
        RATING_MAX: 5
    }
};

// Helper function to build full API URL
function apiUrl(endpoint, ...params) {
    let url = CONFIG.API_BASE_URL + endpoint;
    params.forEach(param => {
        url += '/' + param;
    });
    return url;
}

// Helper function for API requests with credentials
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        credentials: 'include', // Important for session cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    const response = await fetch(apiUrl(endpoint), {
        ...defaultOptions,
        ...options
    });
    
    return response;
}

// Export for use in scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, apiUrl, apiRequest };
}
