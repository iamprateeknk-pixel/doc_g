// BusinessVault AI Assistant & Intelligent Search Module

// Suggested Prompts list based on workspace elements
const SUGGESTED_PROMPTS = [
    "Show GST registration certificate details",
    "When does my FSSAI License expire?",
    "What is the security deposit amount in lease agreement?",
    "Show pending regulatory compliance returns",
    "Analyze risk clauses in Dropbox SaaS vendor agreement"
];

// Initialize AI chatbot UI
function renderAI() {
    loadState();
    
    // Sync templates
    const grid = document.getElementById("ai-suggested-prompts-grid");
    if (grid) {
        grid.innerHTML = "";
        SUGGESTED_PROMPTS.forEach(prompt => {
            const btn = document.createElement("button");
            btn.className = "suggested-prompt-btn";
            btn.innerText = prompt;
            btn.addEventListener("click", () => {
                const input = document.getElementById("ai-chat-input");
                if (input) {
                    input.value = prompt;
                    submitAIChat();
                }
            });
            grid.appendChild(btn);
        });
    }
    
    // Clear chat scrolling area and load default greetings
    const scrollArea = document.getElementById("ai-messages-scroll-area");
    if (scrollArea && scrollArea.children.length === 0) {
        const greetText = `Hello **${BVState.currentRole}**! I'm your secure AI Compliance Assistant. I can read, extract, and monitor all parameters inside your encrypted vaults. 

Feel free to ask questions like:
* *"Show my GST certificate details"*
* *"Does my FSSAI license expire soon?"*
* *"What is the monthly rent inside my lease agreement?"*
* *"Find any pending compliance returns"*`;
        
        appendChatBubble("bot", parseMarkdown(greetText));
    }
    
    // Sync right context panel based on latest uploaded file
    syncAIContextPanel();
}

// Sync latest file metadata context
function syncAIContextPanel() {
    const title = document.getElementById("ai-inspected-doc-title");
    const holder = document.getElementById("ai-ocr-list-holder");
    if (!title || !holder) return;
    
    // Find latest file or file selected via inspector
    let file = null;
    if (activeInspectedFileId) {
        file = BVState.files.find(f => f.id === activeInspectedFileId);
    } else if (BVState.files.length > 0) {
        file = BVState.files[BVState.files.length - 1]; // latest file
    }
    
    if (file) {
        title.innerText = file.name;
        holder.innerHTML = "";
        
        if (file.ocr && Object.keys(file.ocr).length > 0) {
            Object.entries(file.ocr).forEach(([k, v]) => {
                const div = document.createElement("div");
                div.className = "ocr-chip-item";
                div.innerHTML = `
                    <span class="ocr-chip-key">${k}</span>
                    <span class="ocr-chip-val" style="color:var(--accent)">${v}</span>
                `;
                holder.appendChild(div);
            });
        } else {
            holder.innerHTML = `<div style="font-size:12px; color:var(--text-subtle); text-align:center; padding:16px;">No metadata.</div>`;
        }
    }
}

// Append a message bubble to the messages log area
function appendChatBubble(sender, textHtml) {
    const scrollArea = document.getElementById("ai-messages-scroll-area");
    if (!scrollArea) return;
    
    const initials = sender === "user" ? "ME" : "AI";
    const bubbleRow = document.createElement("div");
    bubbleRow.className = `chat-bubble-row ${sender}`;
    
    bubbleRow.innerHTML = `
        <div class="chat-bubble-avatar">${initials}</div>
        <div class="chat-bubble">${textHtml}</div>
    `;
    
    scrollArea.appendChild(bubbleRow);
    scrollArea.scrollTop = scrollArea.scrollHeight;
}

// Show active bot typing indicator
function showTypingIndicator() {
    const scrollArea = document.getElementById("ai-messages-scroll-area");
    if (!scrollArea) return null;
    
    const bubbleRow = document.createElement("div");
    bubbleRow.className = "chat-bubble-row bot";
    bubbleRow.id = "ai-typing-indicator";
    
    bubbleRow.innerHTML = `
        <div class="chat-bubble-avatar">AI</div>
        <div class="chat-bubble" style="padding:4px 10px;">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    scrollArea.appendChild(bubbleRow);
    scrollArea.scrollTop = scrollArea.scrollHeight;
    return bubbleRow;
}

// Submitting a chat query
function submitAIChat() {
    const input = document.getElementById("ai-chat-input");
    if (!input || input.value.trim() === "") return;
    
    const userQuery = input.value.trim();
    input.value = "";
    
    // Add user bubble
    appendChatBubble("user", userQuery);
    
    // Log audit
    addAuditLog("AI_CHAT", `Asked assistant: "${userQuery}"`, "Neural Engine");
    
    // Show typing dots
    const indicator = showTypingIndicator();
    
    // Simulating response timings
    setTimeout(() => {
        if (indicator) indicator.remove();
        
        const answer = processNaturalLanguageQuery(userQuery);
        appendChatBubble("bot", answer);
        
        // Sync context if response switches context files
        syncAIContextPanel();
    }, 1500);
}

// Basic semantic rule parser
function processNaturalLanguageQuery(query) {
    const q = query.toLowerCase();
    
    // 1. GST registration
    if (q.includes("gst certificate") || q.includes("show gst") || q.includes("gst registration")) {
        const file = BVState.files.find(f => f.name.includes("GST"));
        if (file) {
            activeInspectedFileId = file.id; // set active context
            return `Here are the details from your **GST Registration Certificate** (extracted via OCR):
            
* **GSTIN**: \`${file.ocr.GSTIN}\`
* **Legal Entity Name**: **${file.ocr["Legal Name"]}**
* **Registration Date**: \`${file.ocr["Registration Date"]}\`
* **Current Status**: **${file.ocr["Filing Status"]}**

I have loaded this document into your context panel on the right.`;
        }
        return `I couldn't find a GST registration certificate in your active workspace vault. Please try uploading one in the Vault panel.`;
    }
    
    // 2. FSSAI licensing
    if (q.includes("fssai") || q.includes("food safety") || q.includes("fssai expire")) {
        const file = BVState.files.find(f => f.name.includes("FSSAI"));
        if (file) {
            activeInspectedFileId = file.id;
            return `Your **FSSAI Food Safety License** details are as follows:
            
* **License No**: \`${file.ocr["License Number"]}\`
* **Regulatory Expiry Date**: **${file.ocr["FSSAI Expiry"]}**
* **Regulatory Authority**: FSSAI, Government of India

> [!WARNING]
> This license expires on **${file.ocr["FSSAI Expiry"]}**. We have scheduled an automated renewal reminder in the Compliance Center.`;
        }
        return `I couldn't locate an FSSAI License inside the current vault directory. You can check the "Licenses & FSSAI" category folder to confirm.`;
    }
    
    // 3. Lease Agreement Security Deposit
    if (q.includes("lease") || q.includes("deposit") || q.includes("indiranagar")) {
        const file = BVState.files.find(f => f.name.includes("Lease"));
        if (file) {
            activeInspectedFileId = file.id;
            return `I found the lease parameters from the **Commercial Lease Agreement (Indiranagar)**:
            
* **Lessor**: **${file.ocr.Lessor}**
* **Lessee**: **${file.ocr.Lessee}**
* **Monthly Rent Liability**: **${file.ocr["Monthly Rent"]}**
* **Security Deposit Amount**: <strong style="color:var(--success);">${file.ocr["Security Deposit"]}</strong>
* **Lease Expiry Target**: **${file.ocr["Lease Expiry"]}**`;
        }
    }
    
    // 4. Vendor Dropbox Risk analysis
    if (q.includes("dropbox") || q.includes("vendor agreement") || q.includes("risk")) {
        const file = BVState.files.find(f => f.name.includes("Dropbox"));
        if (file) {
            activeInspectedFileId = file.id;
            return `Here is a brief compliance summary of **${file.name}**:
            
* **Parties involved**: **${file.ocr["First Party"]}** and **${file.ocr["Second Party"]}**
* **Annual Contract Value**: **${file.ocr["Contract Amount"]}**
* **Expiration Date**: **${file.ocr["Expiry Date"]}**
* **Risk Clause Review**: Indemnification terms are mutual. The liability limits cap at 2x. 
* **Comment from Lawyer Neha**: *"Reviewed. Mutually balanced risk clauses."*`;
        }
    }
    
    // 5. Compliance schedules
    if (q.includes("pending") || q.includes("compliance") || q.includes("returns") || q.includes("due")) {
        const overdue = BVState.compliance.filter(c => c.status === "Overdue");
        const upcoming = BVState.compliance.filter(c => c.status === "Upcoming");
        
        let answer = `Here are the currently pending regulatory actions in your compliance schedule:
        `;
        
        if (overdue.length > 0) {
            answer += `\n### 🚨 OVERDUE FILINGS:\n`;
            overdue.forEach(item => {
                answer += `* **${item.title}** | Category: **${item.category}** | Was due on: \`${item.date}\`\n`;
            });
        }
        
        if (upcoming.length > 0) {
            answer += `\n### 📅 UPCOMING FILINGS (30 Days):\n`;
            upcoming.forEach(item => {
                answer += `* **${item.title}** | Category: **${item.category}** | Due Date: \`${item.date}\`\n`;
            });
        }
        
        return parseMarkdown(answer);
    }
    
    // Fallbacks
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        return `Hello! How can I assist you with your document intelligence today? Try asking me to analyze your **GST Registration** or **Commercial Lease Agreement**.`;
    }
    
    return `I received your query: "${query}". Based on my semantic search of your Acme Corp files, I could not find a exact data match. 
    
However, I scanned **${BVState.files.length} documents** in your vault. Try searching for direct terms like *"GST"*, *"Dropbox contract"*, *"FSSAI"*, or *"indiranagar lease"*.`;
}

// Connect events
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("ai-chat-input");
    const btnSend = document.getElementById("ai-chat-send-btn");
    
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                submitAIChat();
            }
        });
    }
    
    if (btnSend) {
        btnSend.addEventListener("click", () => {
            submitAIChat();
        });
    }
});

// Simple regex markdown parsing parser for bold and lists
function parseMarkdown(md) {
    let html = md;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline code
    html = html.replace(/`(.*?)`/g, '<code style="background-color:var(--surface-hover); padding:2px 6px; border-radius:4px; font-family:monospace; border:1px solid var(--border-color)">$1</code>');
    
    // Bullet lists
    html = html.replace(/^\*\s(.*)$/gm, '<li style="margin-left: 16px; margin-bottom: 4px;">$1</li>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}
