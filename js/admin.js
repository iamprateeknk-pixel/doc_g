// BusinessVault AI Super Admin & Plan Configuration Module

// Main Settings Tab switcher
document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".admin-nav-item");
    const subpanels = document.querySelectorAll(".admin-subpanel");
    
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const target = tab.getAttribute("data-tab");
            subpanels.forEach(p => {
                p.style.display = "none";
            });
            
            const targetPanel = document.getElementById(`admin-panel-${target}`);
            if (targetPanel) {
                targetPanel.style.display = "block";
            }
        });
    });
    
    // Save system settings
    const saveSysBtn = document.getElementById("admin-save-system-settings");
    if (saveSysBtn) {
        saveSysBtn.addEventListener("click", () => {
            const limit = document.getElementById("admin-input-storage-limit").value;
            BVState.storageLimitMB = parseInt(limit);
            saveState();
            showToast("System configurations updated successfully", "success");
            addAuditLog("ADMIN_CONFIG", `Modified system storage limits to ${limit} MB`, "Admin console");
            renderDashboard();
        });
    }
    
    // Switch subscriptions selector
    const planCards = document.querySelectorAll(".select-plan-btn");
    planCards.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const plan = e.target.getAttribute("data-plan");
            updateActiveSubscriptionPlan(plan);
        });
    });
    
    // Add user click
    const btnAddUser = document.getElementById("admin-btn-add-user");
    if (btnAddUser) {
        btnAddUser.addEventListener("click", createNewTeamMember);
    }
});

// Sync admin subviews
function renderAdmin() {
    loadState();
    renderSubscriptionTiers();
    renderTeamMembersList();
}

// Subscription Cards sync UI
function renderSubscriptionTiers() {
    const plans = document.querySelectorAll(".plan-card");
    const badge = document.getElementById("active-plan-badge");
    
    if (badge) badge.innerText = `Active: ${BVState.activeSubscription} Tier`;
    
    plans.forEach(card => {
        card.classList.remove("popular");
        const btn = card.querySelector(".select-plan-btn");
        const planName = card.getAttribute("data-plan");
        
        if (planName === BVState.activeSubscription) {
            card.style.borderColor = "var(--primary)";
            if (btn) {
                btn.innerText = "Selected";
                btn.className = "btn btn-primary btn-sm select-plan-btn";
            }
        } else {
            card.style.borderColor = "var(--border-color)";
            if (btn) {
                btn.innerText = "Select Tier";
                btn.className = "btn btn-outline btn-sm select-plan-btn";
            }
        }
    });
}

function updateActiveSubscriptionPlan(plan) {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor has read-only privileges.", "danger");
        return;
    }
    
    BVState.activeSubscription = plan;
    
    // Change limits mock
    if (plan === "Free") BVState.storageLimitMB = 2048;
    else if (plan === "Starter") BVState.storageLimitMB = 20480;
    else if (plan === "Professional") BVState.storageLimitMB = 102400;
    else if (plan === "Business") BVState.storageLimitMB = 1048576;
    
    // Notify
    BVState.notifications.unshift({
        id: `n-${Date.now()}`,
        text: `Subscription tier changed to: ${plan}`,
        type: "success",
        read: false,
        time: "Just now"
    });
    
    saveState();
    renderAdmin();
    renderDashboard();
    showToast(`Upgraded subscription successfully to ${plan}!`, "success");
    
    // Log audit
    addAuditLog("BILLING", `Upgraded plan to: ${plan}`, "Billing center");
}

// User CRUD Management list
function renderTeamMembersList() {
    const tbody = document.getElementById("admin-users-tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    BVState.users.forEach(u => {
        const tr = document.createElement("tr");
        
        // Block revoking primary founder
        let actionBtn = `<button class="btn btn-secondary btn-sm" onclick="removeTeamMember('${u.id}')" style="padding:4px 8px; font-size:11px;">Revoke Member</button>`;
        if (u.role === "Founder") {
            actionBtn = `<span style="font-size:11px; color:var(--text-subtle); font-weight:600;">System Administrator</span>`;
        }
        
        let accessCell = "";
        if (u.role === "Founder") {
            accessCell = `<span style="font-size:12px; color:var(--success); font-weight:600;">All Folders (Admin)</span>`;
        } else {
            accessCell = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:12px; color:var(--text-muted); font-weight:500;">${u.folderAccess}</span>
                    <span style="cursor:pointer; color:var(--primary); font-size:11px;" onclick="editUserFolderAccess('${u.id}')" title="Edit Access Boundaries">✏️</span>
                </div>
            `;
        }
        
        tr.innerHTML = `
            <td>
                <div style="font-weight:600; color:var(--text-main);">${u.name}</div>
            </td>
            <td>
                <span class="badge badge-info" style="font-size:9px;">${u.role}</span>
            </td>
            <td><span style="font-size:13px; font-family:monospace; color:var(--text-muted);">${u.email}</span></td>
            <td>${accessCell}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Edit granular access scopes
function editUserFolderAccess(id) {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor has read-only access.", "danger");
        return;
    }
    const user = BVState.users.find(u => u.id === id);
    if (!user) return;
    
    const newAccess = prompt(`Configure folder permissions boundaries for ${user.name} (comma separated folders, e.g. GST, ROC, Agreements):`, user.folderAccess);
    if (newAccess !== null) {
        user.folderAccess = newAccess.trim() || "None";
        saveState();
        renderTeamMembersList();
        showToast(`Access restrictions updated for ${user.name}`, "success");
        addAuditLog("ADMIN_CONFIG", `Updated folder boundaries to: "${user.folderAccess}" for ${user.name}`, "User Directory");
    }
}


// Create new team member
function createNewTeamMember() {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor has read-only access.", "danger");
        return;
    }
    
    const name = prompt("Enter profile name:");
    if (!name || name.trim() === "") return;
    
    const email = prompt("Enter email address:");
    if (!email || email.trim() === "") return;
    
    const role = prompt("Enter Role (CA, Lawyer, Employee, Accountant, Auditor):", "CA");
    if (!role || role.trim() === "") return;
    
    const folderAccess = prompt("Specify folder access boundaries:", "All folders");
    
    const newUser = {
        id: `u-${Date.now()}`,
        name: name.trim(),
        role: role.trim().toUpperCase(),
        email: email.trim(),
        folderAccess: folderAccess || "All folders"
    };
    
    BVState.users.push(newUser);
    saveState();
    renderTeamMembersList();
    showToast(`Added profile: ${name} as ${role}`, "success");
    
    // Log audit
    addAuditLog("CREATE_USER", `Added member role: ${name} (${role})`, "User directory");
}

// Remove team member
function removeTeamMember(id) {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor has read-only access.", "danger");
        return;
    }
    
    const index = BVState.users.findIndex(u => u.id === id);
    if (index === -1) return;
    
    const user = BVState.users[index];
    if (confirm(`Are you sure you want to revoke system credentials for: ${user.name}?`)) {
        BVState.users.splice(index, 1);
        saveState();
        renderTeamMembersList();
        showToast(`User revoked`, "info");
        
        // Log audit
        addAuditLog("REVOKE_USER", `Revoked system credentials for: ${user.name}`, "User directory");
    }
}

// Render Outbound secure links list inside sharing page view
function renderSharing() {
    loadState();
    
    const tbody = document.getElementById("sharing-links-tbody");
    const countBadge = document.getElementById("share-links-count-badge");
    
    if (!tbody) return;
    tbody.innerHTML = "";
    
    if (countBadge) {
        countBadge.innerText = `${BVState.sharedLinks.length} Active Link${BVState.sharedLinks.length === 1 ? '' : 's'}`;
    }
    
    if (BVState.sharedLinks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 24px; color:var(--text-subtle);">
                    No secure links have been shared yet. Open the Document Vault to generate access links.
                </td>
            </tr>
        `;
        return;
    }
    
    BVState.sharedLinks.forEach(link => {
        const tr = document.createElement("tr");
        
        // Restriction select box for live editing permissions
        const restrictionSelect = `
            <select class="form-select" onchange="updateLinkRestriction('${link.id}', this.value)" style="padding: 4px; font-size:11px; width:auto; height:28px;">
                <option value="readonly" ${link.restriction === 'readonly' ? 'selected' : ''}>Read Only</option>
                <option value="watermark" ${link.restriction === 'watermark' ? 'selected' : ''}>Watermarked</option>
                <option value="otp" ${link.restriction === 'otp' ? 'selected' : ''}>OTP Locked</option>
            </select>
        `;
        
        const logId = `sharing-logs-${link.id}`;
        
        tr.innerHTML = `
            <td>
                <span style="font-weight:600; color:var(--text-main); font-size:13px;">${link.fileName}</span>
            </td>
            <td>
                <span style="font-size:13px; font-family:monospace; color:var(--text-muted);">${link.sharedWith}</span>
            </td>
            <td>
                <span style="font-size:12px; font-weight:600;">${link.expiry}</span>
            </td>
            <td>
                ${restrictionSelect}
            </td>
            <td>
                <span style="font-size:12px; font-weight:600; color:var(--primary); cursor:pointer; text-decoration:underline;" onclick="toggleSharingLogs('${logId}')">
                    ${link.count} hits (View Logs)
                </span>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="revokeShareLink('${link.id}')" style="padding:4px 8px; font-size:11px;">Revoke</button>
            </td>
        `;
        tbody.appendChild(tr);
        
        // Collapsible Row
        const trLog = document.createElement("tr");
        trLog.id = logId;
        trLog.style.display = "none";
        
        // Mock visitor records
        let rowsHtml = "";
        if (link.count > 0) {
            for (let i = 0; i < link.count; i++) {
                const minOffset = (i + 1) * 4;
                rowsHtml += `
                    <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-color)">
                        <span>Opened: ${minOffset} hrs ago</span>
                        <span>IP: 192.168.1.${Math.floor(100 + Math.random() * 99)}</span>
                        <span>Device: Chrome (Windows)</span>
                        <span style="color:var(--success)">Spent: ${Math.floor(1 + Math.random() * 8)} mins</span>
                    </div>
                `;
            }
        } else {
            rowsHtml = `<div style="font-size:11px; color:var(--text-subtle); text-align:center;">No visitor traffic logged yet.</div>`;
        }
        
        trLog.innerHTML = `
            <td colspan="6" style="background-color: var(--surface-hover); padding: 12px 20px;">
                <div style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; background-color: var(--surface)">
                    <div style="font-weight:700; font-size:11px; text-transform:uppercase; color:var(--text-subtle); margin-bottom:8px;">Visitor Traffic Trail</div>
                    ${rowsHtml}
                </div>
            </td>
        `;
        tbody.appendChild(trLog);
    });
}

// Live update restriction
function updateLinkRestriction(id, value) {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor has read-only access.", "danger");
        renderSharing();
        return;
    }
    const link = BVState.sharedLinks.find(l => l.id === id);
    if (link) {
        link.restriction = value;
        saveState();
        showToast("Shared link permissions updated!", "success");
        addAuditLog("SHARE_EDIT", `Modified access permission level to ${value} for ${link.fileName}`, "Secure Sharing");
    }
}

// Toggle detail logs
function toggleSharingLogs(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = el.style.display === "none" ? "table-row" : "none";
    }
}


// Revoke outbound access link
function revokeShareLink(id) {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor has read-only access.", "danger");
        return;
    }
    
    const index = BVState.sharedLinks.findIndex(l => l.id === id);
    if (index === -1) return;
    
    const link = BVState.sharedLinks[index];
    if (confirm(`Are you sure you want to revoke access credentials for recipient: ${link.sharedWith}?`)) {
        BVState.sharedLinks.splice(index, 1);
        
        // Notify
        BVState.notifications.unshift({
            id: `n-${Date.now()}`,
            text: `Revoked sharing access link for ${link.fileName} shared to ${link.sharedWith}`,
            type: "danger",
            read: false,
            time: "Just now"
        });
        
        saveState();
        renderSharing();
        showToast(`Secure link access revoked.`, "info");
        
        // Log audit
        addAuditLog("REVOKE", `Revoked secure sharing access link for: ${link.fileName}`, "Secure Link Manager");
    }
}
