// HerCircle Shield - API Client for Extension
// tRPC client helper for communicating with backend

const API_BASE_URL = 'http://localhost:3000/api/trpc';

/**
 * Get authentication session cookie from chrome storage
 */
async function getAuthSession() {
    const { authSession } = await chrome.storage.local.get(['authSession']);
    return authSession;
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
    const session = await getAuthSession();
    return !!session;
}

/**
 * Call backend API using tRPC superjson batch format
 * @param {string} endpoint - API endpoint (e.g., 'incidents.create')
 * @param {object} input - Input data for the API call
 * @returns {Promise<any>} API response data
 */
async function callAPI(endpoint, input = {}) {
    try {
        const session = await getAuthSession();

        // Build request URL with batch parameter
        const url = `${API_BASE_URL}/${endpoint}?batch=1`;

        // Build request body in tRPC superjson format
        const body = JSON.stringify({
            "0": {
                "json": input
            }
        });

        // Make API call
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(session && { 'Cookie': `connect.sid=${session}` })
            },
            credentials: 'include',
            body: body
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Parse response in tRPC superjson batch format
        const data = await response.json();

        // Extract data from batch response
        if (data && data[0] && data[0].result && data[0].result.data) {
            return data[0].result.data.json;
        }

        throw new Error('Invalid API response format');
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

/**
 * API methods organized by router
 */
const api = {
    // Incidents API
    incidents: {
        /**
         * Create a new incident report
         * @param {object} data - Incident data
         * @returns {Promise<{success: boolean, id: number}>}
         */
        create: async (data) => {
            return callAPI('incidents.create', data);
        },

        /**
         * Get list of user's incidents
         * @returns {Promise<Array>}
         */
        list: async () => {
            return callAPI('incidents.list', {});
        },

        /**
         * Get specific incident by ID
         * @param {number} id - Incident ID
         * @returns {Promise<object>}
         */
        get: async (id) => {
            return callAPI('incidents.get', { id });
        }
    },

    // Trusted Contacts API
    contacts: {
        /**
         * Add a trusted contact
         * @param {object} data - Contact data (contactName, contactEmail, contactPhone, relationship)
         * @returns {Promise<{success: boolean}>}
         */
        add: async (data) => {
            return callAPI('contacts.add', data);
        },

        /**
         * Get list of trusted contacts
         * @returns {Promise<Array>}
         */
        list: async () => {
            return callAPI('contacts.list', {});
        },

        /**
         * Delete a trusted contact
         * @param {number} id - Contact ID
         * @returns {Promise<{success: boolean}>}
         */
        delete: async (id) => {
            return callAPI('contacts.delete', { id });
        }
    },

    // Peer Matching API
    peerMatch: {
        /**
         * Join peer matching queue
         * @param {object} data - Match data (supportType, language, country, interests)
         * @returns {Promise<{success: boolean, matched: boolean, matchId?: number}>}
         */
        join: async (data) => {
            return callAPI('peerMatch.join', data);
        }
    },

    // Detection API
    detection: {
        /**
         * Get detection history
         * @returns {Promise<Array>}
         */
        list: async () => {
            return callAPI('detection.list', {});
        }
    },

    // AI Detection (public endpoint, no auth required)
    ai: {
        /**
         * Detect harmful content using AI
         * @param {string} content - Content to analyze
         * @returns {Promise<object>}
         */
        detect: async (content) => {
            return callAPI('ai.detect', { content });
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api, isAuthenticated, getAuthSession };
}
