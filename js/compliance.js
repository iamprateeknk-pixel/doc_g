// BusinessVault AI Compliance Center Management Module

let activeCalendarMonth = 5; // June (0-indexed 5)
let activeCalendarYear = 2026;

// Main renderer
function renderCompliance() {
    loadState();
    renderComplianceSummaryCounters();
    renderComplianceTimelineTable();
    buildCalendarGrid(activeCalendarMonth, activeCalendarYear);
}

// Stats counter cards
function renderComplianceSummaryCounters() {
    let overdue = 0;
    let upcoming = 0;
    let filed = 0;
    
    BVState.compliance.forEach(item => {
        if (item.status === "Overdue") overdue++;
        else if (item.status === "Upcoming") upcoming++;
        else if (item.status === "Filed") filed++;
    });
    
    const overdueCard = document.getElementById("compliance-cnt-overdue");
    const upcomingCard = document.getElementById("compliance-cnt-upcoming");
    const filedCard = document.getElementById("compliance-cnt-filed");
    
    if (overdueCard) overdueCard.innerText = overdue;
    if (upcomingCard) upcomingCard.innerText = upcoming;
    if (filedCard) filedCard.innerText = filed;
}

// Render schedule list table
function renderComplianceTimelineTable() {
    const listBody = document.getElementById("compliance-timeline-tbody");
    const filterStatus = document.getElementById("compliance-filter-status") ? document.getElementById("compliance-filter-status").value : "All";
    
    if (!listBody) return;
    listBody.innerHTML = "";
    
    let filtered = BVState.compliance;
    if (filterStatus !== "All") {
        filtered = filtered.filter(c => c.status === filterStatus);
    }
    
    if (filtered.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 24px; color:var(--text-subtle);">
                    No compliance requirements matching current filter.
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort chronological order
    filtered.sort((a,b) => new Date(a.date) - new Date(b.date));
    
    filtered.forEach(item => {
        const tr = document.createElement("tr");
        
        let badgeClass = "badge-info";
        if (item.status === "Overdue") badgeClass = "badge-danger";
        else if (item.status === "Upcoming") badgeClass = "badge-warning";
        else if (item.status === "Filed") badgeClass = "badge-success";
        
        // Avatar type
        let avatarClass = "gst";
        let avatarTxt = item.category.substring(0,3).toUpperCase();
        if (item.category === "GST") avatarClass = "gst";
        else if (item.category === "ROC") avatarClass = "roc";
        else if (item.category.includes("Tax")) avatarClass = "it";
        else if (item.category === "Licenses") avatarClass = "lic";
        
        // Actions buttons depending on state
        let actionBtn = "";
        if (item.status !== "Filed") {
            actionBtn = `<button class="btn btn-secondary btn-sm" onclick="markFilingAsCompleted('${item.id}')" style="padding:4px 8px; font-size:11px;">Mark Filed</button>`;
        } else {
            actionBtn = `<span style="font-size:11px; color:var(--text-subtle); font-weight:600;">Filed: ${item.completedAt}</span>`;
        }
        
        tr.innerHTML = `
            <td>
                <div class="file-icon-text">
                    <div class="compliance-table-avatar ${avatarClass}">${avatarTxt}</div>
                    <div>
                        <span style="font-weight:600; color:var(--text-main);">${item.title}</span>
                        <div class="file-meta-sub">${item.remarks}</div>
                    </div>
                </div>
            </td>
            <td><span style="font-size:13px; font-weight:600;">${item.date}</span></td>
            <td><span class="badge badge-outline" style="border-color:var(--border-color); color:var(--text-muted);">${item.category}</span></td>
            <td><span class="badge ${badgeClass}">${item.status}</span></td>
            <td>${actionBtn}</td>
        `;
        
        listBody.appendChild(tr);
    });
}

// Complete Filing Event handler
function markFilingAsCompleted(id) {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor has read-only access.", "danger");
        return;
    }
    
    const item = BVState.compliance.find(c => c.id === id);
    if (!item) return;
    
    item.status = "Filed";
    item.completedAt = new Date().toISOString().split('T')[0];
    
    // Add activity notifications log
    BVState.notifications.unshift({
        id: `n-${Date.now()}`,
        text: `Compliance completed: ${item.title} has been filed successfully.`,
        type: "success",
        read: false,
        time: "Just now"
    });
    
    saveState();
    renderCompliance();
    renderDashboard();
    showToast(`Compliance item "${item.title}" marked as Filed!`, "success");
    
    // Log audit
    addAuditLog("COMPLIANCE_FILE", `Filed regulatory return: ${item.title}`, "Tax Ingestion Gateway");
}

// Calendar grid visual renderer
function buildCalendarGrid(month, year) {
    const calendarLabel = document.getElementById("compliance-calendar-month-lbl");
    if (!calendarLabel) return;
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    calendarLabel.innerText = `${months[month]} ${year}`;
    
    // Find calendar container
    const grid = document.querySelector(".calendar-grid");
    if (!grid) return;
    
    // Clean old day cell indicators
    const cells = grid.querySelectorAll(".calendar-cell");
    cells.forEach(c => c.remove());
    
    // First day of target month
    const firstDay = new Date(year, month, 1).getDay();
    // Days total in target month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Empty buffer pads for previous month offsets
    for (let i = 0; i < firstDay; i++) {
        const pad = document.createElement("div");
        pad.className = "calendar-cell";
        grid.appendChild(pad);
    }
    
    // Days list cards
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-cell active-month";
        cell.innerText = day;
        
        // Formulate target string date YYYY-MM-DD
        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        
        // Highlight today
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr === todayStr) {
            cell.classList.add("today");
        }
        
        // Scan files matches to dates compliance events
        const events = BVState.compliance.filter(c => c.date === dateStr);
        if (events.length > 0) {
            // Priority: Overdue > Upcoming > Completed
            if (events.some(e => e.status === "Overdue")) {
                cell.classList.add("has-compliance-danger");
            } else if (events.some(e => e.status === "Upcoming")) {
                cell.classList.add("has-compliance-warning");
            } else {
                cell.classList.add("has-compliance-success");
            }
            
            // Tooltip popups listing
            cell.title = events.map(e => `[${e.status}] ${e.title}`).join('\n');
            cell.addEventListener("click", () => {
                const msg = events.map(e => `• ${e.title} (${e.status}) due on ${e.date}`).join('\n');
                showToast(`Filings scheduled on day ${day}:\n${msg}`, "info");
            });
        }
        
        grid.appendChild(cell);
    }
}

// Connect layout hooks
document.addEventListener("DOMContentLoaded", () => {
    // Dropdown filters handler
    const statusSelect = document.getElementById("compliance-filter-status");
    if (statusSelect) {
        statusSelect.addEventListener("change", () => {
            renderComplianceTimelineTable();
        });
    }
    
    // Month navigation buttons
    const prevBtn = document.getElementById("cal-prev-month");
    const nextBtn = document.getElementById("cal-next-month");
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
            activeCalendarMonth--;
            if (activeCalendarMonth < 0) {
                activeCalendarMonth = 11;
                activeCalendarYear--;
            }
            buildCalendarGrid(activeCalendarMonth, activeCalendarYear);
        });
        
        nextBtn.addEventListener("click", () => {
            activeCalendarMonth++;
            if (activeCalendarMonth > 11) {
                activeCalendarMonth = 0;
                activeCalendarYear++;
            }
            buildCalendarGrid(activeCalendarMonth, activeCalendarYear);
        });
    }
    
    // Compliance Modal creator hooks
    const addCompBtn = document.getElementById("btn-add-compliance");
    const closeCompBtn = document.getElementById("compliance-modal-close");
    const cancelCompBtn = document.getElementById("comp-btn-cancel");
    const saveCompBtn = document.getElementById("comp-btn-save");
    
    if (addCompBtn) {
        addCompBtn.addEventListener("click", () => {
            if (BVState.currentRole === "Auditor") {
                showToast("Auditor has read-only access.", "danger");
                return;
            }
            // Populate defaults
            document.getElementById("comp-input-title").value = "";
            document.getElementById("comp-input-date").value = "2026-07-10";
            document.getElementById("comp-select-category").value = "GST";
            document.getElementById("comp-input-remarks").value = "";
            openModal("modal-compliance-creator");
        });
    }
    
    if (closeCompBtn) closeCompBtn.addEventListener("click", () => closeModal("modal-compliance-creator"));
    if (cancelCompBtn) cancelCompBtn.addEventListener("click", () => closeModal("modal-compliance-creator"));
    
    if (saveCompBtn) {
        saveCompBtn.addEventListener("click", () => {
            const title = document.getElementById("comp-input-title").value;
            const date = document.getElementById("comp-input-date").value;
            const category = document.getElementById("comp-select-category").value;
            const remarks = document.getElementById("comp-input-remarks").value;
            
            if (!title || title.trim() === "") {
                showToast("Please enter a filing title", "warning");
                return;
            }
            
            if (!date) {
                showToast("Please pick a due date", "warning");
                return;
            }
            
            // Compare date to determine status
            const picked = new Date(date);
            const today = new Date();
            today.setHours(0,0,0,0);
            
            let status = "Upcoming";
            if (picked < today) {
                status = "Overdue";
            }
            
            const newComp = {
                id: `c-${Date.now()}`,
                title: title.trim(),
                date: date,
                category: category,
                status: status,
                remarks: remarks || "Scheduled Regulatory Action"
            };
            
            BVState.compliance.push(newComp);
            
            // Notifications log
            BVState.notifications.unshift({
                id: `n-${Date.now()}`,
                text: `Scheduled compliance due: ${title} on ${date}`,
                type: "info",
                read: false,
                time: "Just now"
            });
            
            saveState();
            closeModal("modal-compliance-creator");
            renderCompliance();
            renderDashboard();
            showToast(`Compliance Event Scheduled!`, "success");
            
            // Log audit
            addAuditLog("SCHEDULE_COMPLIANCE", `Scheduled return: ${title} due ${date}`, "Scheduler Engine");
        });
    }
});
