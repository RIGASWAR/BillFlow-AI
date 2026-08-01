const Customer = {
    cart: [],
    user: null,

    // ===========================
    // 1. AUTHENTICATION LOGIC
    // ===========================

    checkAuth() {
        const u = localStorage.getItem("vsp_customer");
        if (!u) {
            window.location.href = "customer_login.html";
            return;
        }
        this.user = JSON.parse(u);
        // Safely try to set the name, in case element doesn't exist on all pages
        const nameEl = document.getElementById("customer-name");
        if (nameEl) nameEl.innerText = this.user.name;
    },

    async register() {
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const pass = document.getElementById("reg-pass").value;

        if (!name || !email || !pass) return alert("Please fill all fields");

        const btn = document.querySelector("#register-section button");
        const originalText = btn.innerText;
        btn.innerText = "Registering...";
        btn.disabled = true;

        // Use API.js method
        const res = await API.customerRegister({ name, email, password: pass });

        if (res.success) {
            alert("Registration Successful! Please Login.");
            toggleAuth(); // Switch to login view
            // Clear fields
            document.getElementById("reg-name").value = "";
            document.getElementById("reg-email").value = "";
            document.getElementById("reg-pass").value = "";
        } else {
            alert("Error: " + res.error);
        }

        btn.innerText = originalText;
        btn.disabled = false;
    },

    async login() {
        const email = document.getElementById("login-email").value;
        const pass = document.getElementById("login-pass").value;

        if (!email || !pass) return alert("Please enter email and password");

        const btn = document.querySelector("#login-section button");
        const originalText = btn.innerText;
        btn.innerText = "Logging in...";
        btn.disabled = true;

        // Use API.js method
        const res = await API.customerLogin({ email, password: pass });

        if (res.success) {
            localStorage.setItem("vsp_customer", JSON.stringify(res.user));
            window.location.href = "customer_dashboard.html";
        } else {
            alert("Login Failed: " + res.error);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },

    logout() {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("vsp_customer");
            window.location.href = "index.html"; // Redirect to Portal Selection
        }
    },

    // ===========================
    // 2. ORDERING LOGIC
    // ===========================

    availableItems: [], // Store fetch items

    async loadItems() {
        this.availableItems = await API.getItems();
        this.renderItems(activeType); // Call new render method with current mode
    },

    renderItems(mode) {
        const sel = document.getElementById("cust-item-select");
        sel.innerHTML = '<option value="">-- Select --</option>';

        this.availableItems.forEach(i => {
            const opt = document.createElement("option");
            opt.value = i.name;
            opt.dataset.price = i.price;
            opt.dataset.stock = i.stock;

            if (mode === 'Estimate') {
                // In Estimate mode, show all, no stock info
                opt.innerText = `${i.name} (₹${i.price})`;
            } else {
                // In Order mode, show stock and disable if out of stock
                opt.innerText = `${i.name} (₹${i.price}) - Stock: ${i.stock}`;
                if (i.stock < 1) {
                    opt.disabled = true;
                    opt.innerText += " [OUT OF STOCK]";
                }
            }
            sel.appendChild(opt);
        });
    },

    // Recommendation Logic (Size based)
    async checkRecs() {
        const sel = document.getElementById("cust-item-select");
        const val = sel.value;
        const box = document.getElementById("cust-rec-box");

        if (!val) {
            box.style.display = 'none';
            return;
        }

        // Use API.js method
        const recs = await API.getRecommendations(val);

        if (recs.length > 0) {
            const list = document.getElementById("cust-rec-items");
            list.innerHTML = "";
            recs.forEach(r => {
                const btn = document.createElement("button");
                btn.className = "btn-primary";
                btn.style.fontSize = "12px";
                btn.style.padding = "4px 8px";
                btn.style.marginLeft = "10px";
                btn.style.background = "#fff";
                btn.style.color = "#007bff";
                btn.style.border = "1px solid #007bff";

                btn.innerText = `+ Add ${r.name}`;
                btn.onclick = () => this.addDirect(r.name, r.price);

                // Add hover effect via JS since it's dynamic
                btn.onmouseover = () => { btn.style.background = "#007bff"; btn.style.color = "#fff"; };
                btn.onmouseout = () => { btn.style.background = "#fff"; btn.style.color = "#007bff"; };

                list.appendChild(btn);
            });
            box.style.display = 'block';
        } else {
            box.style.display = 'none';
        }
    },

    addDirect(name, price) {
        this.addToCartInternal(name, parseFloat(price), 1);
    },

    addToCart() {
        const sel = document.getElementById("cust-item-select");
        const qtyInput = document.getElementById("cust-qty");
        const qty = parseInt(qtyInput.value);

        if (!sel.value) {
            alert("Please select an item first.");
            return;
        }

        const price = parseFloat(sel.options[sel.selectedIndex].dataset.price);
        const stock = parseInt(sel.options[sel.selectedIndex].dataset.stock || 0);

        // Client-side Stock Validation ONLY for Orders
        if (activeType === 'Order' && qty > stock) {
            alert(`Insufficient Stock! Only ${stock} units available.`);
            return;
        }

        this.addToCartInternal(sel.value, price, qty, stock);

        // Reset inputs
        sel.value = "";
        qtyInput.value = 1;
        document.getElementById("cust-rec-box").style.display = 'none';
    },

    addToCartInternal(name, price, qty, maxStock = 999999) {
        if (qty <= 0) return alert("Quantity must be at least 1");

        const exists = this.cart.find(x => x.name === name);
        const currentQty = exists ? exists.qty : 0;

        if (activeType === 'Order' && currentQty + qty > maxStock) {
            return alert(`Cannot add. Total quantity (${currentQty + qty}) exceeds availability (${maxStock}).`);
        }

        if (exists) {
            exists.qty += qty;
        } else {
            this.cart.push({ name, price, qty });
        }
        this.renderCart();
    },

    renderCart() {
        const tbody = document.getElementById("cart-body");
        const cont = document.getElementById("cart-container");

        if (this.cart.length === 0) {
            cont.style.display = 'none';
            return;
        }

        cont.style.display = 'block';
        tbody.innerHTML = "";
        let total = 0;

        this.cart.forEach((item, idx) => {
            const t = item.price * item.qty;
            total += t;
            tbody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${t.toFixed(2)}</td>
                    <td>
                        <button onclick="Customer.removeFromCart(${idx})" 
                                style="color:red; border:none; background:none; cursor:pointer; font-weight:bold; font-size:16px;">
                            &times;
                        </button>
                    </td>
                </tr>
            `;
        });
        document.getElementById("cart-total").innerText = total.toFixed(2);
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    },

    async checkout(docType = 'Tax Invoice') {
        if (this.cart.length === 0) return;
        // if(!confirm("Are you sure you want to place this order?")) return; // Handled by modal now

        const total = parseFloat(document.getElementById("cart-total").innerText);

        const orderData = {
            party_name: this.user.name,
            customer_email: this.user.email,
            items: this.cart.map(i => ({
                name: i.name,
                qty: i.qty,
                price: i.price,
                total: i.price * i.qty
            })),
            total: total,
            status: "Pending", // Initial status for customer orders
            doc_type: docType === 'Order' ? 'Tax Invoice' : 'Estimation' // Map UI mode to Backend Type
        };

        const btn = document.querySelector("#cart-container button");
        const originalText = btn.innerText;
        btn.innerText = "Processing...";
        btn.disabled = true;

        // Use API.js method
        const res = await API.saveSale(orderData);

        if (res.success) {
            alert("Order Placed Successfully! Status: Pending Approval.");
            this.cart = [];
            this.renderCart();
            this.loadHistory(); // Refresh history immediately
        } else {
            alert("Error placing order: " + res.error);
        }

        btn.innerText = originalText;
        btn.disabled = false;
    },

    // ===========================
    // 3. HISTORY & INVOICE
    // ===========================

    async loadHistory(page = 1) {
        if (!this.user) return;

        // Use API.js method with pagination
        const data = await API.getCustomerOrders(this.user.email, page, 10);
        const tb = document.getElementById("history-body");

        // Handle potentially missing data structure gracefully
        const orders = data.orders || [];

        if (!orders || orders.length === 0) {
            tb.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px; color:#777;'>No orders found.</td></tr>";
            document.getElementById('history-pagination').innerHTML = ""; // Clear pagination
            return;
        }

        tb.innerHTML = "";
        orders.forEach(o => {
            const st = o.status || "Completed";

            // Define badge colors dynamically
            let badgeClass = "status-Pending";
            if (st === "Completed") badgeClass = "status-Completed";
            if (st === "Approved") badgeClass = "status-Approved";
            if (st === "Ready") badgeClass = "status-Ready"; // Adding missing Ready color mapping

            // Invoice Button
            const invoiceBtn = `<a href="${API_BASE_URL}/invoice_pdf/${o.id}" target="_blank" class="btn-primary" style="padding:4px 8px; font-size:12px; text-decoration:none;">📄 Download</a>`;

            tb.innerHTML += `
                <tr>
                    <td>${o.created_at}</td>
                    <td style="text-align:right">₹${o.total.toFixed(2)}</td>
                    <td style="text-align:center"><span class="status-badge ${badgeClass}">${st}</span></td>
                    <td style="text-align:center">${invoiceBtn}</td>
                </tr>
            `;
        });

        // Render Pagination Controls
        this.renderHistoryPagination(data.total_pages, data.current_page);
    },

    renderHistoryPagination(totalPages, currentPage) {
        const pan = document.getElementById("history-pagination");
        if (!pan) return;

        if (totalPages <= 1) {
            pan.innerHTML = "";
            return;
        }

        let html = `
            <button class="btn-primary" style="padding:6px 12px; font-size:12px; background:white; color:#333; border:1px solid #ddd; ${currentPage === 1 ? 'opacity:0.5; pointer-events:none;' : ''}"
                onclick="Customer.loadHistory(${currentPage - 1})">Previous</button>
            <span style="font-size:13px; color:#64748b;">Page ${currentPage} of ${totalPages}</span>
            <button class="btn-primary" style="padding:6px 12px; font-size:12px; background:white; color:#333; border:1px solid #ddd; ${currentPage === totalPages ? 'opacity:0.5; pointer-events:none;' : ''}"
                onclick="Customer.loadHistory(${currentPage + 1})">Next</button>
        `;
        pan.innerHTML = html;
    }
};