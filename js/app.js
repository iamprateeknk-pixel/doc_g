// BusinessVault AI Core Application State & Main Router

// Default Initial Mock Data
const INITIAL_DATA = {
    workspace: "acme",
    currentRole: "Founder",
    theme: "dark",
    storageLimitMB: 102400,
    storageUsedMB: 450,
    activeSubscription: "Professional",

    
    users: [
        { id: "u1", name: "Aditya Sharma", role: "Founder", email: "aditya@acme.com", folderAccess: "All Folders" },
        { id: "u2", name: "Sanjay Mehta", role: "CA", email: "sanjay.ca@mehtaparnters.in", folderAccess: "GST, ROC, Income Tax" },
        { id: "u3", name: "Neha Gupta", role: "Lawyer", email: "neha@guptalegal.co", folderAccess: "Agreements, Legal" },
        { id: "u4", name: "Rajesh Kumar", role: "Auditor", email: "rajesh.kumar@icai.org", folderAccess: "Read-Only (All)" },
        { id: "u5", name: "Priyah Singh", role: "Employee", email: "priyah@acme.com", folderAccess: "Vendors, Custom" }
    ],
    
    folders: [
        { id: "f-gst", name: "GST Filings", count: 2, tags: ["GST", "Tax", "Returns"] },
        { id: "f-roc", name: "ROC Records", count: 1, tags: ["ROC", "MCA", "Corporate"] },
        { id: "f-tax", name: "Income Tax", count: 1, tags: ["IT", "Tax", "Form 16"] },
        { id: "f-agreements", name: "Agreements & NDAs", count: 2, tags: ["Contracts", "Lease", "Vendor"] },
        { id: "f-licenses", name: "Licenses & FSSAI", count: 1, tags: ["FSSAI", "License", "Regulatory"] },
        { id: "f-custom", name: "Custom Vault / Personal", count: 1, tags: ["Aadhaar", "Identity", "Personal"] }
    ],
    
    files: [
        { 
            id: "file-1", 
            name: "GST_Registration_Certificate.pdf", 
            folder: "GST Filings", 
            size: "1.2 MB", 
            tags: ["GST", "Tax"], 
            created: "2026-01-12",
            permissions: "All access",
            uploadedBy: "Aditya Sharma",
            comments: [
                { user: "Sanjay Mehta (CA)", text: "Verified with GSTN portal. Active status.", time: "2 days ago" }
            ],
            ocr: {
                "GSTIN": "27AAACQ1234F1Z5",
                "Legal Name": "Acme Corp Limited",
                "Registration Date": "2026-01-10",
                "Filing Status": "Active"
            }
        },
        { 
            id: "file-2", 
            name: "ROC_Filing_MGT-7_FY25.pdf", 
            folder: "ROC Records", 
            size: "2.4 MB", 
            tags: ["ROC", "MCA"], 
            created: "2025-10-30",
            permissions: "Founder, CA, Auditor",
            uploadedBy: "Sanjay Mehta",
            comments: [],
            ocr: {
                "CIN": "L12345MH2018PTC123456",
                "Filing Form": "MGT-7 Annual Return",
                "Financial Year": "2024-25",
                "Submitted On": "2025-10-29"
            }
        },
        { 
            id: "file-3", 
            name: "Income_Tax_Form_16_A.pdf", 
            folder: "Income Tax", 
            size: "840 KB", 
            tags: ["IT", "Tax"], 
            created: "2026-05-18",
            permissions: "Founder, CA",
            uploadedBy: "Sanjay Mehta",
            comments: [],
            ocr: {
                "PAN": "AABCA1234P",
                "Assessment Year": "2026-27",
                "Employer Name": "Acme Corp Ltd",
                "Tax Deducted": "₹1,45,000"
            }
        },
        { 
            id: "file-4", 
            name: "SaaS_Vendor_Agreement_Dropbox.pdf", 
            folder: "Agreements & NDAs", 
            size: "4.8 MB", 
            tags: ["Contracts", "Vendor"], 
            created: "2026-02-10",
            permissions: "Founder, Lawyer",
            uploadedBy: "Aditya Sharma",
            comments: [
                { user: "Neha Gupta (Lawyer)", text: "Liability limit is set to 2x contract value. Reviewed.", time: "1 month ago" }
            ],
            ocr: {
                "First Party": "Acme Corp Ltd",
                "Second Party": "Dropbox Inc",
                "Contract Amount": "$12,400 per annum",
                "Expiry Date": "2027-02-09",
                "Renewal Notification": "30 days prior"
            }
        },
        { 
            id: "file-5", 
            name: "Commercial_Lease_Agreement_Indiranagar.pdf", 
            folder: "Agreements & NDAs", 
            size: "6.2 MB", 
            tags: ["Contracts", "Lease"], 
            created: "2024-06-15",
            permissions: "Founder, Lawyer, Auditor",
            uploadedBy: "Aditya Sharma",
            comments: [],
            ocr: {
                "Lessor": "Indiranagar Realty Trust",
                "Lessee": "Aditya Sharma",
                "Monthly Rent": "₹85,000",
                "Security Deposit": "₹5,10,000",
                "Lease Expiry": "2027-06-14"
            }
        },
        { 
            id: "file-6", 
            name: "FSSAI_Food_Safety_License.pdf", 
            folder: "Licenses & FSSAI", 
            size: "1.1 MB", 
            tags: ["FSSAI", "License"], 
            created: "2023-07-20",
            permissions: "All access",
            uploadedBy: "Aditya Sharma",
            comments: [],
            ocr: {
                "License Number": "10012011000123",
                "Holder Name": "Acme Corp Ltd",
                "FSSAI Expiry": "2026-07-19",
                "Regulatory Body": "FSSAI Government of India"
            }
        },
        { 
            id: "file-7", 
            name: "Aadhaar_Card_Aditya_Sharma.pdf", 
            folder: "Custom Vault / Personal", 
            size: "450 KB", 
            tags: ["Aadhaar", "Personal"], 
            created: "2022-04-05",
            permissions: "Founder Profile Only",
            uploadedBy: "Aditya Sharma",
            comments: [],
            ocr: {
                "Aadhaar Number": "1234-5678-9012",
                "Name": "Aditya Sharma",
                "Date of Birth": "1990-08-14",
                "Gender": "Male"
            }
        }
    ],
    
    compliance: [
        { id: "c1", title: "GSTR-3B Monthly Filing", date: "2026-06-20", category: "GST", status: "Upcoming", remarks: "CGST/SGST liability filing" },
        { id: "c2", title: "ROC Form AOC-4 Financials Filing", date: "2026-06-10", category: "ROC", status: "Overdue", remarks: "Annual filing of balance sheet and profit & loss account" },
        { id: "c3", title: "Income Tax Advance Tax - Quarter 1", date: "2026-06-14", category: "Income Tax", status: "Filed", completedAt: "2026-06-14", remarks: "Q1 corporate tax installment" },
        { id: "c4", title: "TDS Filing Form 26Q - Q1", date: "2026-07-31", category: "Income Tax", status: "Upcoming", remarks: "Quarterly returns of tax deduction at source" },
        { id: "c5", title: "FSSAI License Renewal", date: "2026-07-19", category: "Licenses", status: "Upcoming", remarks: "Food safety standard license renewal" }
    ],
    
    sharedLinks: [
        { id: "s1", fileId: "file-4", fileName: "SaaS_Vendor_Agreement_Dropbox.pdf", sharedWith: "auditor@kpmg.com", expiry: "2026-06-21", restriction: "readonly", count: 3 },
        { id: "s2", fileId: "file-1", fileName: "GST_Registration_Certificate.pdf", sharedWith: "bank-manager@hdfc.com", expiry: "2026-06-28", restriction: "otp, watermark", count: 12 }
    ],
    
    auditLogs: [
        { id: "a1", timestamp: "2026-06-14 14:30:15", user: "Aditya Sharma", action: "UPLOAD", document: "Income_Tax_Form_16_A.pdf", ip: "192.168.1.105" },
        { id: "a2", timestamp: "2026-06-14 11:20:44", user: "Sanjay Mehta (CA)", action: "VIEW", document: "GST_Registration_Certificate.pdf", ip: "203.0.113.88" },
        { id: "a3", timestamp: "2026-06-13 18:05:12", user: "Aditya Sharma", action: "SHARE", document: "GST_Registration_Certificate.pdf", ip: "192.168.1.105" },
        { id: "a4", timestamp: "2026-06-13 10:15:33", user: "Neha Gupta (Lawyer)", action: "DOWNLOAD", document: "SaaS_Vendor_Agreement_Dropbox.pdf", ip: "198.51.100.12" },
        { id: "a5", timestamp: "2026-06-12 16:44:02", user: "Sanjay Mehta (CA)", action: "UPLOAD", document: "ROC_Filing_MGT-7_FY25.pdf", ip: "203.0.113.88" },
        { id: "a6", timestamp: "2026-06-12 09:30:00", user: "Rajesh Kumar (Auditor)", action: "VIEW", document: "ROC_Filing_MGT-7_FY25.pdf", ip: "198.51.100.41" }
    ],
    
    notifications: [
        { id: "n1", text: "Filing overdue: ROC Form AOC-4 Financials Filing was due on June 10, 2026.", type: "danger", read: false, time: "4 hours ago" },
        { id: "n2", text: "CA Sanjay Mehta uploaded ROC_Filing_MGT-7_FY25.pdf", type: "info", read: false, time: "2 days ago" },
        { id: "n3", text: "Secure sharing link created for SaaS_Vendor_Agreement_Dropbox.pdf to auditor@kpmg.com", type: "success", read: true, time: "1 day ago" }
    ]
};

// Global State Instance
let BVState = {};

// Save state back to localStorage
function saveState() {
    localStorage.setItem("businessvault_ai_state", JSON.stringify(BVState));
}

// Load State from LocalStorage
function loadState() {
    const raw = localStorage.getItem("businessvault_ai_state");
    if (!raw) {
        BVState = JSON.parse(JSON.stringify(INITIAL_DATA));
        saveState();
    } else {
        BVState = JSON.parse(raw);
    }
}

// Global Notification Toast System
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container-root");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close">×</button>
    `;
    
    container.appendChild(toast);
    
    // Close listener
    toast.querySelector(".toast-close").addEventListener("click", () => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }, 4000);
}

// Core App Initialization
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    
    // Setup Theme Switcher
    const themeBtn = document.getElementById("theme-toggle-btn");
    const moonIcon = document.getElementById("theme-icon-moon");
    const sunIcon = document.getElementById("theme-icon-sun");
    
    // Apply saved theme state
    if (BVState.theme === "light") {
        document.body.classList.remove("dark");
        moonIcon.style.display = "none";
        sunIcon.style.display = "block";
    } else {
        document.body.classList.add("dark");
        moonIcon.style.display = "block";
        sunIcon.style.display = "none";
    }
    
    themeBtn.addEventListener("click", () => {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark");
            moonIcon.style.display = "none";
            sunIcon.style.display = "block";
            BVState.theme = "light";
        } else {
            document.body.classList.add("dark");
            moonIcon.style.display = "block";
            sunIcon.style.display = "none";
            BVState.theme = "dark";
        }
        saveState();
        showToast("Theme switched successfully!", "info");
    });
    
    // Router logic: Listen to HashChanges
    window.addEventListener("hashchange", routeHandler);
    routeHandler(); // Initial route trigger
    
    // Sandbox role handler setup
    const roleSelector = document.getElementById("role-sandbox-selector");
    if (roleSelector) {
        roleSelector.value = BVState.currentRole;
        roleSelector.addEventListener("change", (e) => {
            changeUserRole(e.target.value);
        });
        applyRoleConstraints(); // Apply initial configuration
    }
    
    // Workspace switcher setup
    const workspaceSelector = document.getElementById("workspace-selector");
    if (workspaceSelector) {
        workspaceSelector.value = BVState.workspace;
        workspaceSelector.addEventListener("change", (e) => {
            BVState.workspace = e.target.value;
            saveState();
            showToast(`Workspace switched to: ${workspaceSelector.options[workspaceSelector.selectedIndex].text}`, "info");
            
            // Re-render everything
            renderDashboard();
            if (typeof renderVault === "function") renderVault();
            if (typeof renderCompliance === "function") renderCompliance();
        });
    }
    
    // Notification list toggle
    const notifBtn = document.getElementById("notification-bell-btn");
    const notifPopover = document.getElementById("notification-popover");
    const notifClose = document.getElementById("close-notifications-btn");
    
    if (notifBtn && notifPopover) {
        notifBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notifPopover.style.display = notifPopover.style.display === "none" ? "block" : "none";
            renderNotifications();
        });
        
        notifClose.addEventListener("click", (e) => {
            e.stopPropagation();
            notifPopover.style.display = "none";
        });
        
        document.addEventListener("click", () => {
            notifPopover.style.display = "none";
        });
        
        notifPopover.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }
    
    // Load components in order
    renderDashboard();
    renderNotifications();
});

// Switch view panels dynamically
function appRoute(targetId) {
    window.location.hash = targetId;
}

function routeHandler() {
    let hash = window.location.hash.substring(1) || "dashboard";
    
    // Handle submenu triggers
    const menuItems = document.querySelectorAll(".nav-item");
    menuItems.forEach(item => {
        item.classList.remove("active");
        if (item.id === `nav-${hash}`) {
            item.classList.add("active");
        }
    });
    
    const views = document.querySelectorAll(".page-view");
    views.forEach(view => {
        view.classList.remove("active");
    });
    
    const targetView = document.getElementById(`view-${hash}`);
    if (targetView) {
        targetView.classList.add("active");
        
        // Custom reload hooks for specific views
        if (hash === "dashboard") renderDashboard();
        if (hash === "vault" && typeof renderVault === "function") renderVault();
        if (hash === "compliance" && typeof renderCompliance === "function") renderCompliance();
        if (hash === "ai" && typeof renderAI === "function") renderAI();
        if (hash === "sharing" && typeof renderSharing === "function") renderSharing();
        if (hash === "audit" && typeof renderAudit === "function") renderAudit();
        if (hash === "admin" && typeof renderAdmin === "function") renderAdmin();
    }
}

// Apply Role-Based Access Control constraints
function applyRoleConstraints() {
    const role = BVState.currentRole;
    
    // Profile Sidebar sync
    const avatar = document.getElementById("sidebar-user-avatar");
    const name = document.getElementById("sidebar-user-name");
    const roleLbl = document.getElementById("sidebar-user-role");
    
    if (role === "Founder") {
        avatar.innerText = "AD";
        name.innerText = "Aditya Sharma";
        roleLbl.innerText = "Founder";
    } else if (role === "CA") {
        avatar.innerText = "SM";
        name.innerText = "Sanjay Mehta";
        roleLbl.innerText = "Chartered Accountant";
    } else if (role === "Lawyer") {
        avatar.innerText = "NG";
        name.innerText = "Neha Gupta";
        roleLbl.innerText = "Corporate Lawyer";
    } else if (role === "Auditor") {
        avatar.innerText = "RK";
        name.innerText = "Rajesh Kumar";
        roleLbl.innerText = "External Auditor";
    } else if (role === "Employee") {
        avatar.innerText = "PS";
        name.innerText = "Priyah Singh";
        roleLbl.innerText = "Operations Executive";
    } else if (role === "Individual") {
        avatar.innerText = "AD";
        name.innerText = "Aditya Sharma (Self)";
        roleLbl.innerText = "Individual";
    }
    
    // Hide/Show navigation settings item based on Admin/Founder access
    const navAdmin = document.getElementById("nav-admin");
    if (navAdmin) {
        if (role === "Founder" || role === "CA") {
            navAdmin.style.display = "flex";
        } else {
            navAdmin.style.display = "none";
            // If current active view is admin, kick them back to dashboard
            if (window.location.hash === "#admin") {
                window.location.hash = "dashboard";
            }
        }
    }
    
    // Modify labels and button displays based on read-only role (e.g., Auditor)
    const vaultUploadBtn = document.getElementById("vault-btn-upload-file");
    const vaultNewFolderBtn = document.getElementById("vault-btn-new-folder");
    const dragDropZone = document.getElementById("vault-drag-drop-zone");
    const complianceBtn = document.getElementById("btn-add-compliance");
    
    if (role === "Auditor") {
        if (vaultUploadBtn) vaultUploadBtn.style.display = "none";
        if (vaultNewFolderBtn) vaultNewFolderBtn.style.display = "none";
        if (dragDropZone) dragDropZone.style.display = "none";
        if (complianceBtn) complianceBtn.style.display = "none";
    } else {
        if (vaultUploadBtn) vaultUploadBtn.style.display = "flex";
        if (vaultNewFolderBtn) vaultNewFolderBtn.style.display = "flex";
        if (dragDropZone) dragDropZone.style.display = "flex";
        if (complianceBtn) complianceBtn.style.display = "flex";
    }
}

// User sandbox switch handler
function changeUserRole(role) {
    BVState.currentRole = role;
    saveState();
    applyRoleConstraints();
    
    // Refresh current view
    routeHandler();
    showToast(`Role Sandbox switched to: ${role}`, "success");
    
    // Log in audit trail
    if (typeof addAuditLog === "function") {
        addAuditLog("SWITCH_ROLE", `Switched Sandbox Active Role to ${role}`, "Local Sandbox");
    }
}

// Render Dashboard View widgets and dynamic states
function renderDashboard() {
    loadState();
    
    // Sync numerical widgets
    const totalDocs = document.getElementById("stat-total-docs");
    const complianceScore = document.getElementById("stat-compliance-score");
    const pendingFilings = document.getElementById("stat-pending-filings");
    
    if (totalDocs) totalDocs.innerText = BVState.files.length;
    
    // Calculate compliance statistics
    let overdueCount = 0;
    let upcomingCount = 0;
    let filedCount = 0;
    
    BVState.compliance.forEach(item => {
        if (item.status === "Overdue") overdueCount++;
        else if (item.status === "Upcoming") upcomingCount++;
        else if (item.status === "Filed") filedCount++;
    });
    
    const scoreVal = filedCount + upcomingCount > 0 
        ? Math.round((filedCount / (overdueCount + upcomingCount + filedCount)) * 100) 
        : 100;
        
    if (complianceScore) complianceScore.innerText = `${scoreVal}%`;
    if (pendingFilings) pendingFilings.innerText = overdueCount + upcomingCount;
    
    const overdueAlert = document.getElementById("stat-overdue-alert");
    if (overdueAlert) {
        overdueAlert.innerText = overdueCount > 0 ? `${overdueCount} filing overdue!` : "No overdue filings";
        overdueAlert.className = overdueCount > 0 ? "stat-trend down" : "stat-trend up";
    }
    
    // Update Score Circle graphic
    const scoreRing = document.getElementById("score-ring-progress");
    const scoreLbl = document.getElementById("health-percentage-lbl");
    if (scoreRing && scoreLbl) {
        scoreLbl.innerText = `${scoreVal}%`;
        const offset = 314.15 - (314.15 * scoreVal) / 100;
        scoreRing.style.strokeDashoffset = offset;
    }
    
    // Sync storage progress metrics
    const storageFill = document.getElementById("dashboard-storage-progress");
    const storageLbl = document.getElementById("dashboard-storage-desc");
    if (storageFill && storageLbl) {
        // Calculate based on files size
        let totalBytes = 0;
        BVState.files.forEach(f => {
            let size = parseFloat(f.size);
            if (f.size.includes("KB")) totalBytes += size * 1024;
            else if (f.size.includes("MB")) totalBytes += size * 1024 * 1024;
        });
        
        const usedMB = Math.round((totalBytes / (1024 * 1024)) * 10) / 10 + 440; // baseline 440MB for hidden storage
        const pct = Math.min(Math.round((usedMB / BVState.storageLimitMB) * 100), 100);
        
        storageFill.style.width = `${pct}%`;
        storageLbl.innerText = `${usedMB} MB used`;
    }
    
    // Sync Compliance snapshot widgets
    const complianceBody = document.getElementById("dashboard-compliance-snapshot-body");
    const snapshotBadge = document.getElementById("dashboard-reminders-badge");
    
    if (complianceBody) {
        complianceBody.innerHTML = "";
        
        // Filter overdue/upcoming ones
        const alerts = BVState.compliance.filter(c => c.status !== "Filed").slice(0, 3);
        
        if (snapshotBadge) {
            snapshotBadge.innerText = alerts.length > 0 ? `${alerts.length} Alerts` : "Clear";
            snapshotBadge.className = alerts.length > 0 ? "badge badge-warning" : "badge badge-success";
        }
        
        if (alerts.length === 0) {
            complianceBody.innerHTML = `<div style="text-align:center; padding: 12px; font-size:12px; color:var(--text-subtle)">No pending regulatory reminders.</div>`;
        } else {
            alerts.forEach(alert => {
                const badgeClass = alert.status === "Overdue" ? "badge-danger" : "badge-warning";
                
                const card = document.createElement("div");
                card.className = "compliance-snapshot-item";
                card.innerHTML = `
                    <div class="snapshot-info">
                        <span class="snapshot-title">${alert.title}</span>
                        <span class="snapshot-date">Due: ${alert.date} (${alert.category})</span>
                    </div>
                    <span class="badge ${badgeClass}">${alert.status}</span>
                `;
                complianceBody.appendChild(card);
            });
        }
    }
    
    // Sync Recent Files listing table
    const recentBody = document.getElementById("dashboard-recent-files-body");
    if (recentBody) {
        recentBody.innerHTML = "";
        
        // Get last 4 files
        const recent = BVState.files.slice(-4).reverse();
        
        recent.forEach(file => {
            const ext = file.name.split('.').pop();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div class="file-icon-text">
                        <div class="file-type-icon ${getFileTypeClass(ext)}">${ext}</div>
                        <div>
                            <span class="file-name-main" onclick="openFileInspector('${file.id}')">${file.name}</span>
                            <div class="file-meta-sub">${file.size} | Folder: ${file.folder}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-info">${file.tags[0] || 'Doc'}</span></td>
                <td><span style="font-size:12px; font-weight:500;">${file.uploadedBy}</span></td>
                <td><span style="font-size:12px; color:var(--text-muted);">${file.created}</span></td>
                <td><span class="badge badge-success" style="font-size:10px;">OCR Scanned</span></td>
            `;
            recentBody.appendChild(tr);
        });
    }
    
    // Sync Live Activity Logs feeds
    const activityFeed = document.getElementById("dashboard-activity-feed-list");
    if (activityFeed) {
        activityFeed.innerHTML = "";
        
        const recentLogs = BVState.auditLogs.slice(0, 4);
        recentLogs.forEach(log => {
            const initials = log.user.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
            
            const div = document.createElement("div");
            div.className = "activity-feed-item";
            div.innerHTML = `
                <div class="activity-avatar">${initials}</div>
                <div class="activity-body">
                    <span class="activity-text">
                        <strong>${log.user}</strong> performed <strong>${log.action}</strong> on ${log.document || "system settings"}
                    </span>
                    <span class="activity-time">${log.timestamp} • IP: ${log.ip}</span>
                </div>
            `;
            activityFeed.appendChild(div);
        });
    }
}

// Render dynamic notifications popover list
function renderNotifications() {
    const listBody = document.getElementById("notification-list-body");
    const badgeDot = document.getElementById("unread-notifications-dot");
    
    if (!listBody) return;
    
    const unread = BVState.notifications.filter(n => !n.read);
    if (badgeDot) {
        badgeDot.style.display = unread.length > 0 ? "block" : "none";
    }
    
    listBody.innerHTML = "";
    if (BVState.notifications.length === 0) {
        listBody.innerHTML = `<div style="text-align:center; padding: 16px; font-size:12px; color:var(--text-subtle)">No alerts in inbox.</div>`;
        return;
    }
    
    BVState.notifications.forEach(item => {
        const div = document.createElement("div");
        div.style.padding = "10px";
        div.style.borderRadius = "var(--radius-sm)";
        div.style.border = "1px solid var(--border-color)";
        div.style.fontSize = "12px";
        div.style.lineHeight = "1.4";
        div.style.cursor = "pointer";
        
        let labelClass = "badge-info";
        if (item.type === "danger") labelClass = "badge-danger";
        else if (item.type === "success") labelClass = "badge-success";
        else if (item.type === "warning") labelClass = "badge-warning";
        
        if (!item.read) {
            div.style.backgroundColor = "var(--primary-glow)";
            div.style.borderLeft = "3px solid var(--primary)";
        } else {
            div.style.backgroundColor = "var(--surface)";
        }
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span class="badge ${labelClass}" style="font-size:8px; padding: 2px 6px;">${item.type.toUpperCase()}</span>
                <span style="font-size:10px; color:var(--text-subtle);">${item.time}</span>
            </div>
            <div style="color:var(--text-main); font-weight:500;">${item.text}</div>
        `;
        
        div.addEventListener("click", () => {
            item.read = true;
            saveState();
            renderNotifications();
            renderDashboard();
        });
        
        listBody.appendChild(div);
    });
}

// Utility mapper helper
function getFileTypeClass(ext) {
    ext = ext.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'xlsx';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg') return 'img';
    return 'docx';
}
