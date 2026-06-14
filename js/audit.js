// BusinessVault AI Audit Trail Center Management Module

// Helper to push a new audit item
function addAuditLog(action, description, componentName) {
    loadState();
    
    let actorName = "Aditya Sharma";
    if (BVState.currentRole === "CA") actorName = "Sanjay Mehta (CA)";
    else if (BVState.currentRole === "Lawyer") actorName = "Neha Gupta (Lawyer)";
    else if (BVState.currentRole === "Auditor") actorName = "Rajesh Kumar (Auditor)";
    else if (BVState.currentRole === "Employee") actorName = "Priyah Singh (Employee)";
    
    const now = new Date();
    const timestampStr = now.getFullYear() + "-" + 
        (now.getMonth() + 1).toString().padStart(2, '0') + "-" + 
        now.getDate().toString().padStart(2, '0') + " " + 
        now.getHours().toString().padStart(2, '0') + ":" + 
        now.getMinutes().toString().padStart(2, '0') + ":" + 
        now.getSeconds().toString().padStart(2, '0');
        
    const newLog = {
        id: `audit-${Date.now()}`,
        timestamp: timestampStr,
        user: actorName,
        action: action,
        document: description,
        ip: "192.168.1." + Math.floor(100 + Math.random() * 99)
    };
    
    BVState.auditLogs.unshift(newLog);
    saveState();
}

// Render log rows
function renderAudit() {
    loadState();
    
    const tbody = document.getElementById("audit-trail-tbody");
    const userFilter = document.getElementById("audit-filter-user") ? document.getElementById("audit-filter-user").value : "All";
    const actionFilter = document.getElementById("audit-filter-action") ? document.getElementById("audit-filter-action").value : "All";
    
    if (!tbody) return;
    tbody.innerHTML = "";
    
    let filtered = BVState.auditLogs;
    
    // User Filter
    if (userFilter !== "All") {
        filtered = filtered.filter(log => log.user.includes(userFilter));
    }
    
    // Action Filter
    if (actionFilter !== "All") {
        filtered = filtered.filter(log => log.action === actionFilter);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 24px; color:var(--text-subtle);">
                    No audit records matching current filters.
                </td>
            </tr>
        `;
        return;
    }
    
    filtered.forEach(log => {
        const tr = document.createElement("tr");
        
        let opBadge = "badge-info";
        if (log.action === "UPLOAD") opBadge = "badge-success";
        else if (log.action === "DELETE" || log.action === "REVOKE") opBadge = "badge-danger";
        else if (log.action === "SHARE") opBadge = "badge-warning";
        else if (log.action === "VIEW") opBadge = "badge-outline";
        
        tr.innerHTML = `
            <td><span style="font-size:12px; font-family:monospace; color:var(--text-muted);">${log.timestamp}</span></td>
            <td>
                <span style="font-weight:600; color:var(--text-main); font-size:13px;">${log.user}</span>
            </td>
            <td>
                <span class="badge ${opBadge}" style="font-size:10px;">${log.action}</span>
            </td>
            <td>
                <span style="font-size:13px; color:var(--text-main); font-weight:500;">${log.document}</span>
            </td>
            <td>
                <span style="font-size:11px; font-family:monospace; color:var(--text-subtle);">${log.ip}</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Connect layout hooks
document.addEventListener("DOMContentLoaded", () => {
    // Select filter changes
    const userSelect = document.getElementById("audit-filter-user");
    const actionSelect = document.getElementById("audit-filter-action");
    const clearBtn = document.getElementById("audit-btn-clear-filters");
    
    if (userSelect) userSelect.addEventListener("change", renderAudit);
    if (actionSelect) actionSelect.addEventListener("change", renderAudit);
    
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (userSelect) userSelect.value = "All";
            if (actionSelect) actionSelect.value = "All";
            renderAudit();
        });
    }
    
    // Export simulation triggers
    const csvBtn = document.getElementById("audit-btn-export-csv");
    const pdfBtn = document.getElementById("audit-btn-export-pdf");
    
    if (csvBtn) {
        csvBtn.addEventListener("click", () => {
            showToast("Generating CSV dataset report...", "info");
            setTimeout(() => {
                showToast("Audit Logs report downloaded successfully (CSV format)!", "success");
                addAuditLog("EXPORT", "Exported CSV compliance log index", "Audit System");
            }, 800);
        });
    }
    
    if (pdfBtn) {
        pdfBtn.addEventListener("click", () => {
            showToast("Compiling official PDF log booklet...", "info");
            setTimeout(() => {
                showToast("Compliance Certificate and logs downloaded (PDF format)!", "success");
                addAuditLog("EXPORT", "Exported PDF signed audit ledger", "Audit System");
            }, 1000);
        });
    }
});
