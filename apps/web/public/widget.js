(function () {
    const script = document.currentScript;
    const agentId = script.getAttribute('data-agent-id');
    const baseUrl = script.getAttribute('data-base-url') || window.location.origin;

    if (!agentId) {
        console.error('Kimi Widget: Missing data-agent-id');
        return;
    }

    // Generate unique ID for the user
    let externalId = localStorage.getItem('kimi_external_id');
    if (!externalId) {
        externalId = 'web_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('kimi_external_id', externalId);
    }

    // Create Widget UI
    const container = document.createElement('div');
    container.id = 'kimi-chat-widget';
    container.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: sans-serif;';

    container.innerHTML = `
        <div id="kimi-chat-window" style="display: none; width: 350px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); flex-direction: column; overflow: hidden; border: 1px solid #f0f0f0;">
            <div style="background: #2563eb; color: white; padding: 20px; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
                <span>AI Assistant</span>
                <button id="kimi-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">&times;</button>
            </div>
            <div id="kimi-messages" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
                <div style="background: #f3f4f6; padding: 10px 15px; border-radius: 15px; border-top-left-radius: 0; font-size: 14px; align-self: flex-start; max-width: 80%;">
                    Hello! How can I help you today?
                </div>
            </div>
            <div style="padding: 15px; border-top: 1px solid #f0f0f0; display: flex; gap: 10px;">
                <input id="kimi-input" type="text" placeholder="Type a message..." style="flex: 1; border: 1px solid #e5e7eb; border-radius: 20px; padding: 8px 15px; outline: none; font-size: 14px;">
                <button id="kimi-send-btn" style="background: #2563eb; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
            </div>
        </div>
        <button id="kimi-toggle-btn" style="width: 60px; height: 60px; background: #2563eb; color: white; border: none; border-radius: 50%; box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        </button>
    `;

    document.body.appendChild(container);

    const toggleBtn = document.getElementById('kimi-toggle-btn');
    const chatWindow = document.getElementById('kimi-chat-window');
    const closeBtn = document.getElementById('kimi-close-btn');
    const sendBtn = document.getElementById('kimi-send-btn');
    const input = document.getElementById('kimi-input');
    const messages = document.getElementById('kimi-messages');

    let isOpen = false;

    toggleBtn.onclick = () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        toggleBtn.style.transform = isOpen ? 'scale(0)' : 'scale(1)';
    };

    closeBtn.onclick = () => {
        isOpen = false;
        chatWindow.style.display = 'none';
        toggleBtn.style.transform = 'scale(1)';
    };

    const addMessage = (text, role) => {
        const div = document.createElement('div');
        div.style.cssText = role === 'user'
            ? 'background: #2563eb; color: white; padding: 10px 15px; border-radius: 15px; border-top-right-radius: 0; font-size: 14px; align-self: flex-end; max-width: 80%;'
            : 'background: #f3f4f6; color: #1f2937; padding: 10px 15px; border-radius: 15px; border-top-left-radius: 0; font-size: 14px; align-self: flex-start; max-width: 80%;';
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    };

    const sendMessage = async () => {
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addMessage(text, 'user');

        try {
            const res = await fetch(`${baseUrl}/api/webhooks/widget/${agentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, externalId })
            });
            const data = await res.json();
            if (data.content) {
                addMessage(data.content, 'assistant');
            }
        } catch (err) {
            console.error('Kimi Widget: Failed to send message', err);
        }
    };

    sendBtn.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

})();
