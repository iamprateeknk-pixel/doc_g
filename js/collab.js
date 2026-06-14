// BusinessVault AI Team Collaboration & Workflows Module

// Render Comments Thread inside inspector modal
function renderComments() {
    const commentBox = document.getElementById("fd-comments-list");
    if (!commentBox) return;
    
    commentBox.innerHTML = "";
    
    const file = BVState.files.find(f => f.id === activeInspectedFileId);
    if (!file) return;
    
    if (!file.comments || file.comments.length === 0) {
        commentBox.innerHTML = `<div style="font-size:11px; color:var(--text-subtle); text-align:center; padding:12px;">No comments. Start collaboration below.</div>`;
        return;
    }
    
    file.comments.forEach(c => {
        const item = document.createElement("div");
        item.style.backgroundColor = "var(--surface-hover)";
        item.style.padding = "8px 10px";
        item.style.borderRadius = "var(--radius-sm)";
        item.style.border = "1px solid var(--border-color)";
        item.style.fontSize = "12px";
        
        // Style mentions
        let textParsed = c.text;
        textParsed = textParsed.replace(/(@[a-zA-Z0-9_\(\)]+)/g, '<strong style="color:var(--primary);">$1</strong>');
        
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-weight:600; color:var(--text-main); font-size:11px;">${c.user}</span>
                <span style="color:var(--text-subtle); font-size:10px;">${c.time}</span>
            </div>
            <div style="color:var(--text-muted); line-height:1.4;">${textParsed}</div>
        `;
        commentBox.appendChild(item);
    });
    
    commentBox.scrollTop = commentBox.scrollHeight;
}

// Add a comment
function postComment() {
    const input = document.getElementById("fd-new-comment-txt");
    if (!input || input.value.trim() === "") return;
    
    const text = input.value.trim();
    input.value = "";
    
    const file = BVState.files.find(f => f.id === activeInspectedFileId);
    if (!file) return;
    
    if (!file.comments) file.comments = [];
    
    let username = "Aditya Sharma";
    if (BVState.currentRole === "CA") username = "Sanjay Mehta (CA)";
    else if (BVState.currentRole === "Lawyer") username = "Neha Gupta (Lawyer)";
    else if (BVState.currentRole === "Auditor") username = "Rajesh Kumar (Auditor)";
    else if (BVState.currentRole === "Employee") username = "Priyah Singh (Employee)";
    
    file.comments.push({
        user: username,
        text: text,
        time: "Just now"
    });
    
    // Scan text for collaboration mentions/notifications triggering
    checkForMentions(text, file.name);
    
    saveState();
    renderComments();
    showToast("Comment added", "success");
    
    // Log audit
    addAuditLog("COMMENT", `Added comment on file: ${file.name} - "${text.substring(0, 25)}..."`, "Collaboration Hub");
}

// Check comments for tagging mentions e.g., @CA, @Lawyer
function checkForMentions(text, filename) {
    const lower = text.toLowerCase();
    
    if (lower.includes("@ca") || lower.includes("@sanjay")) {
        BVState.notifications.unshift({
            id: `n-${Date.now()}-ca`,
            text: `CA Sanjay Mehta was tagged in comment on "${filename}"`,
            type: "info",
            read: false,
            time: "Just now"
        });
        showToast("CA notified of tag in comment thread.", "info");
    }
    
    if (lower.includes("@lawyer") || lower.includes("@neha")) {
        BVState.notifications.unshift({
            id: `n-${Date.now()}-law`,
            text: `Lawyer Neha Gupta was tagged in comment on "${filename}"`,
            type: "info",
            read: false,
            time: "Just now"
        });
        showToast("Lawyer notified of tag in comment thread.", "info");
    }
    
    if (lower.includes("@founder") || lower.includes("@aditya")) {
        BVState.notifications.unshift({
            id: `n-${Date.now()}-fnd`,
            text: `Founder Aditya Sharma was tagged in comment on "${filename}"`,
            type: "info",
            read: false,
            time: "Just now"
        });
        showToast("Founder notified of tag in comment thread.", "info");
    }
}
