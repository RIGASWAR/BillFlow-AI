// ============================================
// UI UTILITIES & MANAGEMENT
// ============================================

const UI = {
    // Helper: Format numbers as Indian Rupee
    formatMoney: (amount) => {
        if (amount === undefined || amount === null) return "₹ 0.00";
        return "₹ " + parseFloat(amount).toFixed(2);
    },

    // Helper: Format dates to readable string
    formatDate: (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    },

    // ============================================
    // 1. ITEMS PAGE LOGIC
    // ============================================

    async loadItemsPage() {
        const tableBody = document.getElementById("items-table-body");
        if (!tableBody) return;

        tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Loading inventory...</td></tr>";

        try {
            let items = await API.getItems();

            if (!items || items.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No items found. Add one above!</td></tr>";
                return;
            }

            // ROBUST SORTING LOGIC
            items.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                const getDia = (s) => {
                    const match = s.match(/(\d+)\s*mm/);
                    return match ? parseInt(match[1]) : 99999;
                };
                const getLen = (s) => {
                    const match = s.match(/(\d+(\.\d+)?)\s*(mtr|m|meter)/);
                    return match ? parseFloat(match[1]) : 99999;
                };
                const getClass = (s) => {
                    const match = s.match(/np\s*[-]?\s*(\d+)/);
                    return match ? parseInt(match[1]) : 99999;
                };
                const diaDiff = getDia(nameA) - getDia(nameB);
                if (diaDiff !== 0) return diaDiff;
                const lenDiff = getLen(nameA) - getLen(nameB);
                if (lenDiff !== 0) return lenDiff;
                return getClass(nameA) - getClass(nameB);
            });

            tableBody.innerHTML = "";

            items.forEach(item => {
                const row = document.createElement("tr");
                const stockVal = item.stock || 0;
                const stockColor = (stockVal < 20) ? '#d32f2f' : '#2e7d32';
                const stockBg = (stockVal < 20) ? '#ffebee' : '#e8f5e9';

                row.innerHTML = `
                    <td style="font-weight:500;">${item.name}</td>
                    <td>${UI.formatMoney(item.price)}</td>
                    <td>${item.gst || 18}%</td>
                    <td>
                        <span style="background:${stockBg}; color:${stockColor}; padding:4px 8px; border-radius:12px; font-weight:bold; font-size:12px;">
                            ${stockVal}
                        </span>
                    </td>
                    <td>
                        <button class="btn-primary" style="padding:5px 10px; font-size:12px; margin-right:5px; background-color:#ff9800; border:none;" 
                            onclick='UI.editItem(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                            ✏️
                        </button>
                        <button class="delete-btn" onclick="UI.deleteItem('${item.id}')" style="padding:5px 10px; font-size:12px;">
                            🗑
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = "<tr><td colspan='5' style='color:red; text-align:center;'>Error loading items.</td></tr>";
        }
    },

    filterItems() {
        const input = document.getElementById("item-search");
        if (!input) return;
        const filter = input.value.toUpperCase();
        const table = document.getElementById("items-table-body");
        const tr = table.getElementsByTagName("tr");

        for (let i = 0; i < tr.length; i++) {
            const td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                const txtValue = td.textContent || td.innerText;
                tr[i].style.display = (txtValue.toUpperCase().indexOf(filter) > -1) ? "" : "none";
            }
        }
    },

    editItem(item) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById("item-id").value = item.id;
        document.getElementById("item-name").value = item.name;
        document.getElementById("item-price").value = item.price;
        document.getElementById("item-gst").value = item.gst;
        document.getElementById("item-stock").value = item.stock;

        const btn = document.querySelector("#add-item-form button");
        if (btn) {
            btn.innerHTML = "💾 Update Item";
            btn.style.backgroundColor = "#ff9800";
        }
    },

    async deleteItem(id) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Delete Pipe?',
                text: "This item will be removed from inventory permanently.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, Delete'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const res = await API.deleteItem(id);
                    if (res.success) {
                        Swal.fire({
                            title: 'Deleted!',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        UI.loadItemsPage();
                    } else {
                        Swal.fire('Error', res.error || 'Failed to delete item.', 'error');
                    }
                }
            });
        } else if (confirm("Delete this pipe from inventory?")) {
            const res = await API.deleteItem(id);
            if (res.success) {
                UI.loadItemsPage();
            } else {
                alert(res.error || 'Failed to delete item.');
            }
        }
    },

    async setupItemForm() {
        const form = document.getElementById("add-item-form");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector("button[type='submit']");
            submitBtn.disabled = true;

            const itemId = document.getElementById("item-id").value;
            const itemData = {
                name: document.getElementById("item-name").value,
                price: document.getElementById("item-price").value,
                gst: document.getElementById("item-gst").value,
                stock: document.getElementById("item-stock").value
            };

            let result = itemId ? await API.updateItem(itemId, itemData) : await API.addItem(itemData);

            if (result.success) {
                Swal.fire({
                    title: 'Success!',
                    text: itemId ? 'Item updated successfully.' : 'Item added to inventory.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                form.reset();
                document.getElementById("item-id").value = "";
                submitBtn.innerHTML = "+ Add Item";
                submitBtn.style.backgroundColor = "";
                UI.loadItemsPage();
            } else {
                Swal.fire('Error', result.error || "Could not save item", 'error');
            }
            submitBtn.disabled = false;
        });
    },

    // ============================================
    // 2. PARTIES (CUSTOMERS) PAGE LOGIC
    // ============================================

    async setupPartyForm() {
        const form = document.getElementById("add-party-form");
        if (!form) {
            console.warn("Party form not found on this page.");
            return;
        }

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("Add Customer form submitted"); // Debug log

            const nameInput = document.getElementById("party-name");
            const phoneInput = document.getElementById("party-phone");
            const addressInput = document.getElementById("party-address");

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const address = addressInput.value.trim();

            if (!name || !phone) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Name and Phone are required.', 'error');
                } else {
                    alert('Name and Phone are required.');
                }
                return;
            }

            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "Saving...";
            }

            try {
                const partyData = { name, phone, address };
                const result = await API.addParty(partyData);

                if (result.success) {
                    if (typeof Swal !== 'undefined') {
                        await Swal.fire({
                            title: 'Success!',
                            text: 'Customer added successfully.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                    form.reset();
                    this.loadPartiesPage();
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'Already Exists',
                            text: result.error || 'This customer name or phone is already registered.',
                            icon: 'warning',
                            confirmButtonColor: '#3085d6'
                        });
                    } else {
                        alert(result.error || 'Duplicate entry.');
                    }
                }
            } catch (err) {
                console.error("Party submission error:", err);
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Could not connect to the server.', 'error');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = "+ Add Customer";
                }
            }
        });
    },

    async loadPartiesPage() {
        const tableBody = document.getElementById("parties-table-body");
        if (!tableBody) return;

        tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Loading customers...</td></tr>";

        try {
            const parties = await API.getParties();
            if (!parties || parties.length === 0) {
                tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No customers found. Add one!</td></tr>";
                return;
            }
            tableBody.innerHTML = "";
            parties.forEach(p => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td style="font-weight:500;">${p.name}</td>
                    <td>${p.phone || '-'}</td>
                    <td>${p.address || '-'}</td>
                    <td>
                        <button class="delete-btn" style="background:#e3f2fd; color:#007bff; border:1px solid #90caf9; padding:4px 8px; margin-right:5px;"
                            onclick="UI.viewCustomerHistory('${p.name}')">
                            View History
                        </button>
                        <button class="delete-btn" style="background:#ffebee; color:#c62828; border:1px solid #ef9a9a; padding:4px 8px;"
                            onclick="UI.deleteParty('${p.id}')">
                            Delete
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (e) {
            tableBody.innerHTML = "<tr><td colspan='4' style='color:red; text-align:center;'>Error loading customers.</td></tr>";
        }
    },

    async deleteParty(id) {
        if (typeof Swal !== 'undefined') {
            const result = await Swal.fire({
                title: 'Delete Customer?',
                text: "This action cannot be undone!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, Delete'
            });

            if (result.isConfirmed) {
                const res = await API.deleteParty(id);
                if (res.success) {
                    Swal.fire('Deleted!', 'Customer removed.', 'success');
                    this.loadPartiesPage();
                } else {
                    Swal.fire('Error', res.error || 'Failed to delete.', 'error');
                }
            }
        } else if (confirm("Delete this customer?")) {
            const res = await API.deleteParty(id);
            if (res.success) {
                this.loadPartiesPage();
            } else {
                alert(res.error);
            }
        }
    },

    async viewCustomerHistory(partyName) {
        const modal = document.getElementById("historyModal");
        const tbody = document.getElementById("history-table-body");
        const title = document.getElementById("history-title");

        if (modal) modal.style.display = "block";
        if (title) title.innerText = `Order History: ${partyName}`;
        if (tbody) tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Loading records...</td></tr>";

        try {
            // FIX: Use dedicated endpoint instead of filtering all sales client-side
            const history = await API.getPartyHistory(partyName);

            if (!history || history.length === 0) {
                tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px; color:#777;'>No history found.</td></tr>";
                return;
            }

            tbody.innerHTML = "";
            history.forEach(sale => {
                const st = sale.status || "Completed";
                let badgeClass = "status-Pending";
                if (st === "Completed") badgeClass = "status-Completed";
                if (st === "Approved") badgeClass = "status-Approved";

                tbody.innerHTML += `
                    <tr>
                        <td>${sale.created_at || '-'}</td>
                        <td><span class="status-badge ${badgeClass}">${st}</span></td>
                        <td>${UI.formatMoney(sale.total)}</td>
                        <td>
                            <a href="${API_BASE_URL}/invoice_pdf/${sale.id}" target="_blank" class="btn-primary" 
                               style="padding:4px 8px; font-size:12px; text-decoration:none;">
                                📄 PDF
                            </a>
                            <button onclick="UI.sendWhatsApp('${sale.id}', '${partyName}', '${sale.created_at || ''}', ${sale.total})" class="btn-primary" style="padding:4px 8px; font-size:12px; background-color:#25D366; border:none; margin-left:5px;">
                                💬 WA
                            </button>
                        </td>
                    </tr>`;
            });
        } catch (err) {
            tbody.innerHTML = "<tr><td colspan='4' style='color:red; text-align:center;'>Error fetching history.</td></tr>";
        }
    },

    // ============================================
    // 3. DASHBOARD ACTION LOGIC (Active Orders)
    // ============================================

    async loadActiveOrders(page = 1) {
        const activeBody = document.getElementById("active-orders-body");
        const srchInput = document.getElementById("activeOrdersSearch");
        if (!activeBody) return;

        activeBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Loading active orders...</td></tr>";

        const qSearch = srchInput ? srchInput.value : "";

        try {
            const data = await API.getActiveOrders(page, 10, qSearch);
            activeBody.innerHTML = "";

            // Handle API returning array or paginated object safely
            let active = [];
            let totalPages = 0;
            let current = 1;

            if (Array.isArray(data)) {
                active = data;
            } else if (data && data.active_orders) {
                active = data.active_orders;
                totalPages = data.total_pages;
                current = data.current_page;
            }

            if (!active || active.length === 0) {
                activeBody.innerHTML = "<tr><td colspan='4' style='text-align:center; padding:20px;'>No active orders.</td></tr>";
                UI.renderActivePagination(0, 1);
                return;
            }

            active.forEach(order => {
                let actionBtn = "";
                if (order.status === 'Approved') {
                    actionBtn = `<button class="btn-ready" onclick="handleMarkReady('${order.id}')">Mark Ready</button>`;
                } else if (order.status === 'Ready') {
                    actionBtn = `<span style="font-size:11px; color:green;">Ready for Dispatch</span>`;
                }

                activeBody.innerHTML += `
                <tr>
                    <td>${order.created_at || '-'}</td>
                    <td>${order.party_name || '-'}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>${actionBtn || order.next_step || '-'}</td>
                </tr>`;
            });

            UI.renderActivePagination(totalPages, current);
        } catch (err) {
            console.error("Active Error:", err);
            activeBody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:red;'>Error fetching active orders.</td></tr>";
        }
    },

    async sendWhatsApp(saleId, partyName, date, total) {
        // 1. Fetch phone number from API
        let phoneStr = "";
        try {
            const res = await API.getPartyPhone(partyName);
            if (res.success && res.phone) {
                phoneStr = res.phone;
            }
        } catch (e) { console.error("Could not fetch phone", e); }

        // Ensure 10-digit standard or fallback to empty to let admin type it
        if (!phoneStr || phoneStr.length < 10) {
            const { value: inputPhone } = await Swal.fire({
                title: 'Enter Customer Phone Number',
                input: 'text',
                inputLabel: `No valid phone found for ${partyName}`,
                inputPlaceholder: '9876543210',
                showCancelButton: true
            });
            if (!inputPhone) return;
            phoneStr = inputPhone;
        }

        // Clean up format (e.g. remove spaces, ensure standard format)
        phoneStr = phoneStr.replace(/\D/g, '');
        // Prepend India country code if length is exactly 10
        if (phoneStr.length === 10) {
            phoneStr = "91" + phoneStr;
        }

        // 2. Format WhatsApp Message
        const amount = UI.formatMoney(total);
        const msg = `Hello ${partyName},\n\nHere are the details for your recent order dated ${date}:\n\n*Invoice Total: ${amount}*\n\nPlease find the attached PDF invoice for your reference.\n\nThank you, \nVellore Spun Pipes`;

        // 3. Open WhatsApp Link
        const url = `https://wa.me/${phoneStr}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    },

    renderActivePagination(totalPages, currentPage) {
        const pan = document.getElementById("active-pagination");
        if (!pan) return;

        if (totalPages <= 1) {
            pan.innerHTML = "";
            return;
        }

        pan.innerHTML = `
            <button class="btn-primary" style="padding:6px 12px; font-size:12px; background:white; color:#333; border:1px solid #ddd; ${currentPage === 1 ? 'opacity:0.5; pointer-events:none;' : ''}"
                onclick="UI.loadActiveOrders(${currentPage - 1})">Previous</button>
            <span style="font-size:13px; color:#64748b;">Page ${currentPage} of ${totalPages}</span>
            <button class="btn-primary" style="padding:6px 12px; font-size:12px; background:white; color:#333; border:1px solid #ddd; ${currentPage === totalPages ? 'opacity:0.5; pointer-events:none;' : ''}"
                onclick="UI.loadActiveOrders(${currentPage + 1})">Next</button>
        `;
    },

    // ============================================
    // 4. ACTION HANDLERS
    // ============================================

    async approveOrder(saleId) {
        try {
            const confirm = await Swal.fire({
                title: 'Approve Order?',
                text: "This will move the order to production.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Approve',
                cancelButtonText: 'Cancel'
            });

            if (!confirm.isConfirmed) return;

            const result = await API.updateOrderStatus(saleId, "Approved");

            if (result.success) {
                await Swal.fire({
                    title: 'Approved!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                if (typeof UI.loadDashboard === 'function') {
                    UI.loadDashboard();
                } else {
                    window.location.reload();
                }
            } else {
                Swal.fire('Error', result.error || "Could not approve order", 'error');
            }
        } catch (err) {
            console.error("Approval Error:", err);
            Swal.fire('Error', 'An unexpected error occurred.', 'error');
        }
    }
};

// ============================================
// AUTO-INITIALIZE ON LOAD
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // Check for Items Page
    if (document.getElementById("items-table-body")) {
        UI.loadItemsPage();
        UI.setupItemForm();

        const searchInput = document.getElementById("item-search");
        if (searchInput) {
            searchInput.addEventListener("keyup", UI.filterItems);
        }
    }
    // Check for Parties Page
    // Check for both the table and the form to ensure logic is attached
    if (document.getElementById("parties-table-body") || document.getElementById("add-party-form")) {
        UI.loadPartiesPage();
        UI.setupPartyForm();
    }
});