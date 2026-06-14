// BusinessVault AI Document Vault Management Module

let currentFolderFilter = "All";
let currentTagFilter = "All";

// Populate Folders Sidebar and Files Table
function renderVault() {
    loadState();
    renderFolderTree();
    renderTagFilters();
    renderFilesList();
}

// Generate the sidebar folder list
function renderFolderTree() {
    const treeList = document.getElementById("vault-folder-tree-list");
    if (!treeList) return;
    
    treeList.innerHTML = "";
    
    // Default "All Documents" wrapper
    const allItem = document.createElement("div");
    allItem.className = `folder-tree-item ${currentFolderFilter === "All" ? "active" : ""}`;
    allItem.innerHTML = `
        <div class="folder-info">
            <svg class="folder-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>All Documents</span>
        </div>
        <span class="folder-count">${BVState.files.length}</span>
    `;
    allItem.addEventListener("click", () => {
        currentFolderFilter = "All";
        renderVault();
    });
    treeList.appendChild(allItem);
    
    // Specific folders from state
    BVState.folders.forEach(folder => {
        // Count files in folder
        const count = BVState.files.filter(f => f.folder === folder.name).length;
        
        const item = document.createElement("div");
        item.className = `folder-tree-item ${currentFolderFilter === folder.name ? "active" : ""}`;
        item.innerHTML = `
            <div class="folder-info">
                <svg class="folder-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>${folder.name}</span>
            </div>
            <span class="folder-count">${count}</span>
        `;
        item.addEventListener("click", () => {
            currentFolderFilter = folder.name;
            renderVault();
        });
        treeList.appendChild(item);
    });
}

// Render horizontal tag filters row
function renderTagFilters() {
    const row = document.getElementById("vault-tag-filters-row");
    if (!row) return;
    
    row.innerHTML = `<span style="font-size:12px; color:var(--text-subtle); font-weight:600;">Tags:</span>`;
    
    // Default All
    const allTag = document.createElement("span");
    allTag.className = `tag-pill ${currentTagFilter === "All" ? "active" : ""}`;
    allTag.innerText = "All";
    allTag.addEventListener("click", () => {
        currentTagFilter = "All";
        renderVault();
    });
    row.appendChild(allTag);
    
    // Extract unique tags from files
    const uniqueTags = new Set();
    BVState.files.forEach(f => {
        if (f.tags && Array.isArray(f.tags)) {
            f.tags.forEach(t => uniqueTags.add(t));
        }
    });
    
    uniqueTags.forEach(tag => {
        const pill = document.createElement("span");
        pill.className = `tag-pill ${currentTagFilter === tag ? "active" : ""}`;
        pill.innerText = tag;
        pill.addEventListener("click", () => {
            currentTagFilter = tag;
            renderVault();
        });
        row.appendChild(pill);
    });
}

// Render files list under filters and folder
function renderFilesList() {
    const listBody = document.getElementById("vault-files-list-body");
    const breadcrumb = document.getElementById("vault-current-breadcrumbs");
    const searchVal = document.getElementById("vault-search-input") ? document.getElementById("vault-search-input").value.toLowerCase() : "";
    
    if (!listBody) return;
    listBody.innerHTML = "";
    
    // Set breadcrumbs title text
    if (breadcrumb) {
        breadcrumb.innerText = currentFolderFilter === "All" 
            ? "Vault / All Documents" 
            : `Vault / ${currentFolderFilter}`;
    }
    
    // Filtering logic
    let filtered = BVState.files;
    
    // 1. Folder check
    if (currentFolderFilter !== "All") {
        filtered = filtered.filter(f => f.folder === currentFolderFilter);
    }
    
    // 2. Tag check
    if (currentTagFilter !== "All") {
        filtered = filtered.filter(f => f.tags && f.tags.includes(currentTagFilter));
    }
    
    // 3. Search text check
    if (searchVal.trim() !== "") {
        filtered = filtered.filter(f => {
            const matchesName = f.name.toLowerCase().includes(searchVal);
            const matchesTag = f.tags.some(t => t.toLowerCase().includes(searchVal));
            // Check OCR metadata matches
            let matchesOCR = false;
            if (f.ocr) {
                matchesOCR = Object.values(f.ocr).some(val => val.toLowerCase().includes(searchVal));
            }
            return matchesName || matchesTag || matchesOCR;
        });
    }
    
    // Render list
    if (filtered.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 32px; color:var(--text-subtle);">
                    No files found matching criteria. Upload a file or adjust filters.
                </td>
            </tr>
        `;
        return;
    }
    
    filtered.forEach(file => {
        const ext = file.name.split('.').pop();
        const tr = document.createElement("tr");
        
        // Tags rendering
        let tagsHtml = "";
        file.tags.forEach(t => {
            tagsHtml += `<span class="badge badge-info" style="margin-right:4px;">${t}</span>`;
        });
        
        tr.innerHTML = `
            <td>
                <div class="file-icon-text">
                    <div class="file-type-icon ${getFileTypeClass(ext)}">${ext}</div>
                    <div>
                        <span class="file-name-main" onclick="openFileInspector('${file.id}')">${file.name}</span>
                        <div class="file-meta-sub">Uploaded by ${file.uploadedBy}</div>
                    </div>
                </div>
            </td>
            <td><span style="font-size:13px; font-weight:500;">${file.size}</span></td>
            <td>${tagsHtml}</td>
            <td><span style="font-size:13px; color:var(--text-muted);">${file.created}</span></td>
            <td><span class="badge badge-success" style="font-size:10px;">${file.permissions}</span></td>
            <td>
                <div class="file-actions-btn-group">
                    <button class="action-icon-btn share" onclick="openShareModal('${file.id}')" title="Secure Share Outbound">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314" /></svg>
                    </button>
                    <button class="action-icon-btn delete" onclick="deleteFile('${file.id}')" title="Delete Document">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px; height:14px;"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                </div>
            </td>
        `;
        listBody.appendChild(tr);
    });
}

// Connect layout events
document.addEventListener("DOMContentLoaded", () => {
    // Search input keypress
    const search = document.getElementById("vault-search-input");
    if (search) {
        search.addEventListener("keyup", () => {
            renderVault();
        });
    }
    
    // New folder popup simulation
    const btnNewFolder = document.getElementById("vault-btn-new-folder");
    if (btnNewFolder) {
        btnNewFolder.addEventListener("click", () => {
            if (BVState.currentRole === "Auditor") {
                showToast("Auditor has read-only permissions.", "danger");
                return;
            }
            const name = prompt("Enter folder name:");
            if (name && name.trim() !== "") {
                const existing = BVState.folders.find(f => f.name.toLowerCase() === name.toLowerCase());
                if (existing) {
                    showToast("Folder already exists!", "warning");
                    return;
                }
                
                BVState.folders.push({
                    id: `f-${Date.now()}`,
                    name: name.trim(),
                    count: 0,
                    tags: ["Custom"]
                });
                saveState();
                renderVault();
                showToast(`Created folder "${name}"`, "success");
                
                // Audit logging
                addAuditLog("CREATE_FOLDER", `Created folder: ${name}`, "System Folder Setup");
            }
        });
    }
    
    // File upload handlers
    const btnUpload = document.getElementById("vault-btn-upload-file");
    const hiddenInput = document.getElementById("vault-hidden-file-input");
    const dropzone = document.getElementById("vault-drag-drop-zone");
    
    if (btnUpload && hiddenInput) {
        btnUpload.addEventListener("click", () => {
            if (BVState.currentRole === "Auditor") {
                showToast("Auditor has read-only access.", "danger");
                return;
            }
            hiddenInput.click();
        });
    }
    
    if (hiddenInput) {
        hiddenInput.addEventListener("change", (e) => {
            handleFileUpload(e.target.files);
        });
    }
    
    if (dropzone) {
        dropzone.addEventListener("click", () => {
            if (BVState.currentRole === "Auditor") return;
            hiddenInput.click();
        });
        
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("active");
        });
        
        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("active");
        });
        
        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("active");
            if (BVState.currentRole === "Auditor") {
                showToast("Auditor has read-only access.", "danger");
                return;
            }
            handleFileUpload(e.dataTransfer.files);
        });
    }
    
    // Setup Comments Send button
    const btnPost = document.getElementById("fd-btn-send-comment");
    if (btnPost) {
        btnPost.addEventListener("click", postComment);
    }
});

// Handle files uploads
function handleFileUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    
    // Simulated upload transition
    showToast("Uploading and initiating OCR scans...", "info");
    
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        setTimeout(() => {
            const ext = file.name.split('.').pop() || "pdf";
            
            // Smart classification based on file name content
            let folder = "Custom Vault / Personal";
            let tags = ["Upload"];
            let ocrData = { "Status": "OCR Scanned successfully" };
            let permissions = "All access";
            
            const nameLower = file.name.toLowerCase();
            
            if (nameLower.includes("gst")) {
                folder = "GST Filings";
                tags = ["GST", "Tax"];
                ocrData = {
                    "GSTIN": "27AAACQ" + Math.floor(1000 + Math.random() * 9000) + "F1Z5",
                    "Legal Name": "Acme Corp Limited",
                    "Filing Month": "June 2026",
                    "Amount Reported": "₹2,44,500"
                };
            } else if (nameLower.includes("roc") || nameLower.includes("mgt") || nameLower.includes("aoc")) {
                folder = "ROC Records";
                tags = ["ROC", "MCA"];
                ocrData = {
                    "CIN": "L12345MH2018PTC123456",
                    "Form Registered": "Annual Returns",
                    "Authority": "Ministry of Corporate Affairs"
                };
            } else if (nameLower.includes("tax") || nameLower.includes("pan") || nameLower.includes("tds")) {
                folder = "Income Tax";
                tags = ["IT", "Tax"];
                ocrData = {
                    "PAN": "AABCA" + Math.floor(1000 + Math.random() * 9000) + "P",
                    "Tax Category": "Assessment Return"
                };
            } else if (nameLower.includes("agreement") || nameLower.includes("nda") || nameLower.includes("contract")) {
                folder = "Agreements & NDAs";
                tags = ["Contracts", "Vendor"];
                ocrData = {
                    "First Party": "Acme Corp Ltd",
                    "Second Party": "Vendor Inc",
                    "Lease Value": "₹60,000",
                    "Renewal Trigger": "July 2027"
                };
            } else if (nameLower.includes("fssai") || nameLower.includes("license")) {
                folder = "Licenses & FSSAI";
                tags = ["FSSAI", "License"];
                ocrData = {
                    "License Number": "100" + Math.floor(10000000000 + Math.random() * 90000000000),
                    "FSSAI Expiry": "2027-08-15"
                };
            }
            
            // Format size
            const sizeStr = file.size > 1024 * 1024 
                ? (Math.round((file.size / (1024 * 1024)) * 10) / 10) + " MB"
                : (Math.round(file.size / 1024)) + " KB";
            
            const newFile = {
                id: `file-${Date.now()}-${i}`,
                name: file.name,
                folder: folder,
                size: sizeStr,
                tags: tags,
                created: new Date().toISOString().split('T')[0],
                permissions: permissions,
                uploadedBy: BVState.currentRole === "CA" ? "Sanjay Mehta" : "Aditya Sharma",
                comments: [],
                ocr: ocrData
            };
            
            BVState.files.push(newFile);
            
            // Add automated notifications for CA uploads
            if (BVState.currentRole === "CA") {
                BVState.notifications.unshift({
                    id: `n-${Date.now()}`,
                    text: `CA Sanjay Mehta uploaded corporate file: ${file.name}`,
                    type: "info",
                    read: false,
                    time: "Just now"
                });
            }
            
            saveState();
            renderVault();
            renderDashboard();
            showToast(`Document "${file.name}" processed and indexed successfully!`, "success");
            
            // Log audit
            addAuditLog("UPLOAD", `Uploaded file: ${file.name} to ${folder}`, "Encryption Pipeline");
        }, 1200 + (i * 300));
    }
}

// Delete Document
function deleteFile(fileId) {
    if (BVState.currentRole === "Auditor") {
        showToast("Auditor doesn't have edit/delete permissions.", "danger");
        return;
    }
    
    const index = BVState.files.findIndex(f => f.id === fileId);
    if (index === -1) return;
    
    const file = BVState.files[index];
    if (confirm(`Are you sure you want to permanently delete: ${file.name}?`)) {
        BVState.files.splice(index, 1);
        saveState();
        renderVault();
        renderDashboard();
        showToast(`Document deleted`, "info");
        
        // Log audit
        addAuditLog("DELETE", `Deleted file: ${file.name}`, "Secure Shredder");
    }
}

// Global inspector triggers
let activeInspectedFileId = null;

function openFileInspector(fileId) {
    const file = BVState.files.find(f => f.id === fileId);
    if (!file) return;
    
    activeInspectedFileId = fileId;
    
    const ext = file.name.split('.').pop();
    document.getElementById("fd-modal-title").innerText = `Inspect: ${file.name}`;
    document.getElementById("fd-preview-extension").innerText = ext;
    document.getElementById("fd-name").innerText = file.name;
    
    // Render OCR Metadata chips
    const ocrList = document.getElementById("fd-ocr-list");
    ocrList.innerHTML = "";
    
    if (file.ocr && Object.keys(file.ocr).length > 0) {
        Object.entries(file.ocr).forEach(([k, v]) => {
            const div = document.createElement("div");
            div.className = "ocr-chip-item";
            div.innerHTML = `
                <span class="ocr-chip-key">${k}</span>
                <span class="ocr-chip-val" style="color:var(--primary)">${v}</span>
            `;
            ocrList.appendChild(div);
        });
    } else {
        ocrList.innerHTML = `<div style="font-size:12px; color:var(--text-subtle)">No metadata extracted.</div>`;
    }
    
    // Render comments thread
    renderComments();
    
    // Setup modal button click mappings
    const downloadBtn = document.getElementById("fd-btn-download");
    const shareBtn = document.getElementById("fd-btn-action-share");
    
    downloadBtn.onclick = () => {
        showToast(`Downloaded copy: ${file.name}`, "success");
        addAuditLog("DOWNLOAD", `Downloaded document copy: ${file.name}`, "Secured Direct Client download");
    };
    
    shareBtn.onclick = () => {
        closeModal("modal-file-detail");
        openShareModal(fileId);
    };
    
    openModal("modal-file-detail");
    
    // Log audit
    addAuditLog("VIEW", `Inspected document metadata: ${file.name}`, "Workspace Viewer");
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("active");
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("active");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Close inspector
    const fdClose = document.getElementById("fd-modal-close");
    if (fdClose) {
        fdClose.addEventListener("click", () => closeModal("modal-file-detail"));
    }
    
    // Close share creator
    const shareClose = document.getElementById("share-modal-close");
    const shareCancel = document.getElementById("share-btn-cancel");
    if (shareClose) shareClose.addEventListener("click", () => closeModal("modal-share-creator"));
    if (shareCancel) shareCancel.addEventListener("click", () => closeModal("modal-share-creator"));
    
    // Generate secure link button hook
    const generateBtn = document.getElementById("share-btn-generate");
    if (generateBtn) {
        generateBtn.addEventListener("click", generateShareLink);
    }
});

// Launch Secure Outbound sharing setup dialog
let activeShareFileId = null;

function openShareModal(fileId) {
    const file = BVState.files.find(f => f.id === fileId);
    if (!file) return;
    
    activeShareFileId = fileId;
    document.getElementById("share-document-label").innerText = file.name;
    document.getElementById("share-input-target").value = "";
    openModal("modal-share-creator");
}

// Generate shared details and store
function generateShareLink() {
    const target = document.getElementById("share-input-target").value;
    const expiryDays = document.getElementById("share-select-expiry").value;
    const restriction = document.getElementById("share-select-restriction").value;
    
    if (!target || target.trim() === "") {
        showToast("Please enter a valid recipient email or mobile number.", "warning");
        return;
    }
    
    const file = BVState.files.find(f => f.id === activeShareFileId);
    if (!file) return;
    
    // Calculate expiry dates
    let expiryStr = "Never";
    if (expiryDays !== "never") {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(expiryDays));
        expiryStr = d.toISOString().split('T')[0];
    }
    
    const newLink = {
        id: `s-${Date.now()}`,
        fileId: file.id,
        fileName: file.name,
        sharedWith: target,
        expiry: expiryStr,
        restriction: restriction,
        count: 0
    };
    
    BVState.sharedLinks.push(newLink);
    
    // Notification to owner
    BVState.notifications.unshift({
        id: `n-${Date.now()}`,
        text: `Secure sharing link generated for ${file.name} to ${target}`,
        type: "success",
        read: false,
        time: "Just now"
    });
    
    saveState();
    closeModal("modal-share-creator");
    showToast("Outbound encrypted link generated and copied to clipboard!", "success");
    
    // Re-render outbound sharing tracker if we are on that screen
    if (window.location.hash === "#sharing" && typeof renderSharing === "function") {
        renderSharing();
    }
    
    // Log audit
    addAuditLog("SHARE", `Created secure link for ${file.name} to ${target}`, "Secure Link Generator");
}
