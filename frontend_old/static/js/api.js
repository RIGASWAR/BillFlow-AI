// ============================================
// CONFIGURATION
// ============================================

// ⚠️ IMPORTANT: Replace this URL with your actual Render Backend URL after deployment
// Example: "https://vellore-spun-pipes-backend.onrender.com/api"
const API_BASE_URL = "http://127.0.0.1:5000/api";
// Note: Keep it as http://127.0.0.1:5000/api while testing locally.

// ============================================
// CONFIGURATION
// ============================================



const API = {

    // =======================
    // 1. ITEMS ENDPOINTS
    // =======================

    async getItems() {
        try {
            const response = await fetch(`${API_BASE_URL}/items`);
            if (!response.ok) throw new Error("Failed to fetch items");
            return await response.json();
        } catch (error) {
            console.error("API Error (getItems):", error);
            return [];
        }
    },

    async addItem(itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/add_item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemData)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (addItem):", error);
            return { success: false, error: error.message };
        }
    },

    async updateItem(id, itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/update_item/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemData)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (updateItem):", error);
            return { success: false, error: error.message };
        }
    },

    async deleteItem(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete_item/${id}`, {
                method: "DELETE"
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (deleteItem):", error);
            return { success: false, error: error.message };
        }
    },

    // =======================
    // 2. PARTIES (CUSTOMERS)
    // =======================

    async getParties() {
        try {
            const response = await fetch(`${API_BASE_URL}/parties`);
            if (!response.ok) throw new Error("Failed to fetch parties");
            return await response.json();
        } catch (error) {
            console.error("API Error (getParties):", error);
            return [];
        }
    },

    async addParty(partyData) {
        try {
            const response = await fetch(`${API_BASE_URL}/add_party`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(partyData)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (addParty):", error);
            return { success: false, error: error.message };
        }
    },

    async deleteParty(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/parties/${id}`, {
                method: "DELETE"
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (deleteParty):", error);
            return { success: false, error: error.message };
        }
    },

    async getPartyPhone(partyName) {
        try {
            const response = await fetch(`${API_BASE_URL}/party_phone/${encodeURIComponent(partyName)}`);
            if (!response.ok) throw new Error("Failed to fetch party phone");
            return await response.json();
        } catch (error) {
            console.error("API Error (getPartyPhone):", error);
            return { success: false, error: error.message };
        }
    },

    // =======================
    // 3. SALES ENDPOINTS
    // =======================

    async getSales(page = 1, limit = 10, search = "") {
        try {
            const response = await fetch(`${API_BASE_URL}/sales?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error("Failed to fetch sales");
            return await response.json();
        } catch (error) {
            console.error("API Error (getSales):", error);
            // Return structure matching backend so UI doesn't break
            return { sales: [], total_pages: 0, current_page: 1 };
        }
    },

    async saveSale(saleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/save_sale`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(saleData)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (saveSale):", error);
            return { success: false, error: error.message };
        }
    },

    // ✅ NEW: Fetch Pending Approvals
    async getPendingOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/pending_orders`);
            if (!response.ok) throw new Error("Failed to fetch pending orders");
            return await response.json();
        } catch (error) {
            console.error("API Error (getPendingOrders):", error);
            return [];
        }
    },

    // ✅ NEW: Fetch Sales History for specific Party
    async getPartyHistory(partyName) {
        try {
            const response = await fetch(`${API_BASE_URL}/sales/party/${encodeURIComponent(partyName)}`);
            if (!response.ok) throw new Error("Failed to fetch party history");
            return await response.json();
        } catch (error) {
            console.error("API Error (getPartyHistory):", error);
            return [];
        }
    },

    // ✅ NEW: Fetch Active/Processing Orders

    // ✅ NEW: Fetch Active/Processing Orders (With Pagination & Search)
    async getActiveOrders(page = 1, limit = 10, search = "") {
        try {
            const response = await fetch(`${API_BASE_URL}/active_orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error("Failed to fetch active orders");
            return await response.json();
        } catch (error) {
            console.error("API Error (getActiveOrders):", error);
            // Return structured fallback
            return { active_orders: [], total_pages: 0, current_page: 1 };
        }
    },

    // ✅ NEW: Update Order Status (Approve/Reject/Ready)
    async updateOrderStatus(saleId, status, items = []) {
        try {
            const response = await fetch(`${API_BASE_URL}/update_order_status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sale_id: saleId,
                    status: status,
                    items: items // Only needed for Rejection (to restore stock)
                })
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (updateOrderStatus):", error);
            return { success: false, error: error.message };
        }
    },

    // =======================
    // 4. ML RECOMMENDATIONS
    // =======================

    // Replace your current getRecommendations in api.js with this temporary version:
    async getRecommendations(itemName) {
        try {
            const response = await fetch(`${API_BASE_URL}/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_name: itemName })
            });
            if (!response.ok) throw new Error("Failed to fetch recommendations");
            const data = await response.json();
            return data.recommendations || [];
        } catch (error) {
            console.error("API Error (getRecommendations):", error);
            return [];
        }
    },
    // In static/js/api.js
    async convertToInvoice(saleId) {
        const response = await fetch(`${API_BASE_URL}/api/convert_to_invoice/${saleId}`, {
            method: 'POST'
        });
        return await response.json();
    },
    // =======================
    // 5. GAN PREDICTIONS
    // =======================

    async getPredictions() {
        try {
            // Fix: Use correct backend endpoint /api/ai_forecast
            const response = await fetch(`${API_BASE_URL}/ai_forecast`);
            if (!response.ok) throw new Error("Failed to fetch predictions");
            return await response.json();
        } catch (error) {
            console.error("API Error (getPredictions):", error);
            return [];
        }
    },

    // =======================
    // 6. CUSTOMER PORTAL AUTH & ORDERS
    // =======================

    async customerRegister(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/customer_register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (customerRegister):", error);
            return { success: false, error: error.message };
        }
    },

    async customerLogin(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/customer_login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("API Error (customerLogin):", error);
            return { success: false, error: error.message };
        }
    },

    async getCustomerOrders(email, page = 1, limit = 10) {
        try {
            const response = await fetch(`${API_BASE_URL}/customer_orders/${encodeURIComponent(email)}?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error("Failed to fetch customer orders");
            return await response.json();
        } catch (error) {
            console.error("API Error (getCustomerOrders):", error);
            return { orders: [], total_pages: 0, current_page: 1 };
        }
    }
};