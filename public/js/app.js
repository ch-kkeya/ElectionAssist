document.addEventListener('DOMContentLoaded', () => {

    /* --- DOM Elements --- */
    const wizardOverlay = document.getElementById('wizard-overlay');
    const mainContent = document.getElementById('main-content');
    const wizardStepContainer = document.getElementById('wizard-step-container');
    const wizardYesBtn = document.getElementById('wizard-yes-btn');
    const wizardNoBtn = document.getElementById('wizard-no-btn');
    const wizardResult = document.getElementById('wizard-result');
    const restartWizardBtn = document.getElementById('restart-wizard-btn');

    const timelineContainer = document.getElementById('timeline-container');
    const phaseDetails = document.getElementById('phase-details');
    const detailTitle = document.getElementById('detail-title');
    const detailDesc = document.getElementById('detail-desc');
    const detailContent = document.getElementById('detail-content');

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatFeed = document.getElementById('chat-feed');
    const chipBtns = document.querySelectorAll('.chip-btn');

    const checklistUl = document.getElementById('checklist');
    const checklistProgress = document.getElementById('checklist-progress');

    /* --- Eligibility Wizard Logic --- */
    const wizardQuestions = [
        "Are you 18 years of age or older?",
        "Are you a citizen of this country?",
        "Do you have a valid, government-issued ID?"
    ];
    let currentWizardStep = 0;

    function initWizard() {
        // Check if user has already passed or chose guest mode
        const passed = localStorage.getItem('wizardPassed');
        if (passed === 'true' || passed === 'false') {
            closeWizard();
            return;
        }
        
        wizardOverlay.classList.remove('hidden');
        mainContent.classList.add('blur-sm');
        restartWizardBtn.classList.add('hidden');
        currentWizardStep = 0;
        showWizardQuestion();
    }

    function showWizardQuestion() {
        wizardStepContainer.innerHTML = `<h3 class="text-2xl font-semibold text-gray-700 animate-fade-in">${wizardQuestions[currentWizardStep]}</h3>`;
        wizardResult.classList.add('hidden');
        wizardYesBtn.classList.remove('hidden');
        wizardNoBtn.classList.remove('hidden');
    }

    function closeWizard() {
        wizardOverlay.classList.add('opacity-0');
        setTimeout(() => {
            wizardOverlay.classList.add('hidden');
            mainContent.classList.remove('blur-sm');
            restartWizardBtn.classList.remove('hidden');
        }, 500);
    }

    wizardYesBtn.addEventListener('click', () => {
        // Show checkmark animation
        const originalContent = wizardYesBtn.innerHTML;
        wizardYesBtn.innerHTML = `<svg class="w-6 h-6 inline-block text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
        
        setTimeout(() => {
            wizardYesBtn.innerHTML = originalContent;
            currentWizardStep++;
            if (currentWizardStep < wizardQuestions.length) {
                showWizardQuestion();
            } else {
                // Passed all questions
                wizardStepContainer.innerHTML = `<h3 class="text-2xl font-bold text-green-600">You are eligible to vote!</h3><p class="text-gray-600 mt-2">Let's explore the election process.</p>`;
                wizardYesBtn.classList.add('hidden');
                wizardNoBtn.classList.add('hidden');
                localStorage.setItem('wizardPassed', 'true');
                setTimeout(() => {
                    closeWizard();
                    renderChecklist();
                }, 2000);
            }
        }, 400); // 400ms animation
    });

    wizardNoBtn.addEventListener('click', () => {
        wizardStepContainer.innerHTML = `<h3 class="text-xl font-bold text-red-600">Eligibility Notice</h3>`;
        wizardResult.innerHTML = `Based on your answer, you may not be eligible to vote in the upcoming election. Please consult your local election authority for official guidelines.`;
        wizardResult.classList.remove('hidden');
        wizardResult.classList.add('bg-red-50', 'text-red-700', 'border', 'border-red-200');
        wizardYesBtn.classList.add('hidden');
        wizardNoBtn.classList.add('hidden');
        
        // Give them a button to just browse anyway
        const browseBtn = document.createElement('button');
        browseBtn.className = "mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition";
        browseBtn.innerText = "Browse as Guest";
        browseBtn.onclick = () => {
            localStorage.setItem('wizardPassed', 'false');
            closeWizard();
            renderChecklist();
        };
        wizardStepContainer.appendChild(browseBtn);
    });

    restartWizardBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to restart verification? This will clear your checklist and AI chat history.')) {
            localStorage.removeItem('wizardPassed');
            
            // Clear checklist data
            checklistData = defaultChecklist.map(item => ({ ...item, checked: false }));
            saveChecklist();

            // Clear chat history
            chatHistory = [];
            localStorage.removeItem('chatHistory');
            renderChatHistory();

            wizardOverlay.classList.remove('hidden', 'opacity-0');
            mainContent.classList.add('blur-sm');
            initWizard();
            renderChecklist();
        }
    });


    /* --- Interactive Timeline Logic --- */
    let timelineData = [];

    async function loadTimeline() {
        try {
            const response = await fetch('/api/data');
            timelineData = await response.json();
            renderTimeline();
        } catch (error) {
            console.error("Error loading timeline:", error);
            timelineContainer.innerHTML = "<p class='text-red-500'>Failed to load timeline data.</p>";
        }
    }

    function renderTimeline() {
        timelineContainer.innerHTML = '';
        timelineData.forEach((phase, index) => {
            const node = document.createElement('div');
            node.className = `timeline-node flex flex-col items-center w-32 shrink-0 ${index === 0 ? 'active' : ''}`;
            node.dataset.id = phase.id;
            
            node.innerHTML = `
                <div class="timeline-icon z-10 mb-3 text-lg">${phase.id}</div>
                <div class="text-center">
                    <span class="text-sm font-semibold text-gray-800 block leading-tight">${phase.title}</span>
                </div>
            `;

            node.addEventListener('click', () => selectPhase(phase.id, node));
            timelineContainer.appendChild(node);
        });

        // Show first phase by default
        if (timelineData.length > 0) {
            showPhaseDetails(timelineData[0]);
        }
    }

    function selectPhase(id, nodeElement) {
        // Update active class
        document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
        nodeElement.classList.add('active');

        // Find data and show details
        const phase = timelineData.find(p => p.id === id);
        if (phase) {
            showPhaseDetails(phase);
        }
    }

    function showPhaseDetails(phase) {
        phaseDetails.classList.remove('hidden');
        // Simple fade effect
        phaseDetails.classList.remove('opacity-100');
        phaseDetails.classList.add('opacity-0');
        
        setTimeout(() => {
            detailTitle.textContent = `${phase.id}. ${phase.title}`;
            detailDesc.textContent = phase.description;
            detailContent.textContent = phase.details;
            
            phaseDetails.classList.remove('opacity-0');
            phaseDetails.classList.add('opacity-100');
        }, 150);
    }


    /* --- Quick-Action Assistant (Gemini) Logic --- */
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

    function renderChatHistory() {
        chatFeed.innerHTML = '';
        if (chatHistory.length === 0) {
            chatFeed.innerHTML = `
                <div class="ai-msg bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-gray-700 text-sm w-5/6">
                    Hello! I'm your election assistant. Try asking one of the questions below or type your own.
                </div>
            `;
            return;
        }

        chatHistory.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `p-3 shadow-sm border text-sm max-w-[85%] ${
                msg.sender === 'user' 
                ? 'user-msg border-blue-500 ml-auto' 
                : 'ai-msg bg-white border-gray-100 text-gray-700'
            }`;
            
            let formattedMessage = msg.text;
            if(msg.sender === 'ai') {
                 formattedMessage = marked.parse(msg.text);
                 msgDiv.classList.add('rounded-2xl', 'rounded-tl-none', 'markdown-content');
            } else {
                 msgDiv.classList.add('rounded-2xl', 'rounded-tr-none');
            }

            msgDiv.innerHTML = formattedMessage;
            chatFeed.appendChild(msgDiv);
        });
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }
    
    function addMessageToChat(message, sender, save = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `p-3 shadow-sm border text-sm max-w-[85%] ${
            sender === 'user' 
            ? 'user-msg border-blue-500 ml-auto' 
            : 'ai-msg bg-white border-gray-100 text-gray-700'
        }`;
        
        // Use marked for AI responses to properly parse markdown
        let formattedMessage = message;
        if(sender === 'ai') {
             formattedMessage = marked.parse(message);
             msgDiv.classList.add('rounded-2xl', 'rounded-tl-none', 'markdown-content');
        } else {
             msgDiv.classList.add('rounded-2xl', 'rounded-tr-none');
        }

        msgDiv.innerHTML = formattedMessage;
        chatFeed.appendChild(msgDiv);
        chatFeed.scrollTop = chatFeed.scrollHeight;

        if (save) {
            chatHistory.push({ text: message, sender: sender });
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }
    }

    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'chat-loading';
        loadingDiv.className = 'ai-msg bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 w-24 flex items-center h-10';
        loadingDiv.innerHTML = '<div class="dot-flashing"></div>';
        chatFeed.appendChild(loadingDiv);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function removeLoadingIndicator() {
        const loadingDiv = document.getElementById('chat-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    async function sendToGemini(message) {
        addMessageToChat(message, 'user');
        chatInput.value = '';
        showLoadingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            removeLoadingIndicator();

            if (response.ok) {
                addMessageToChat(data.reply, 'ai');
            } else {
                addMessageToChat(`Error: ${data.error}`, 'ai');
            }
        } catch (error) {
            console.error("Chat Error:", error);
            removeLoadingIndicator();
            addMessageToChat("Connection error. Please ensure the server is running and API key is set.", 'ai');
        }
    }

    // Handle form submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (msg) {
            sendToGemini(msg);
        }
    });

    // Handle chip clicks
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const msg = btn.textContent;
            sendToGemini(msg);
        });
    });


    /* --- Personal Voter Checklist Logic --- */
    const defaultChecklist = [
        { id: 'chk1', text: 'Confirm eligibility', instruction: 'Check your local election authority website for age, citizenship, and residency requirements.', checked: false },
        { id: 'chk2', text: 'Register to vote', instruction: 'Submit your voter registration application online, by mail, or in person before the deadline.', checked: false },
        { id: 'chk3', text: 'Research candidates', instruction: 'Review candidate manifestos, past records, and debates to make an informed choice.', checked: false },
        { id: 'chk4', text: 'Locate polling station', instruction: 'Use official election portals to find your designated voting booth and its operating hours.', checked: false },
        { id: 'chk5', text: 'Prepare necessary ID', instruction: 'Gather acceptable identification documents like a Voter ID, driver\'s license, or passport.', checked: false }
    ];

    let savedChecklist = JSON.parse(localStorage.getItem('voterChecklist')) || [];
    let checklistData = defaultChecklist.map(defItem => {
        const savedItem = savedChecklist.find(item => item.id === defItem.id);
        return { ...defItem, checked: savedItem ? savedItem.checked : defItem.checked };
    });

    function renderChecklist() {
        checklistUl.innerHTML = '';
        let completedCount = 0;
        const isGuest = localStorage.getItem('wizardPassed') === 'false';

        if (isGuest) {
            checklistUl.setAttribute('title', "As you are not eligible to vote, you can't access the checklist.");
        } else {
            checklistUl.removeAttribute('title');
        }

        checklistData.forEach((item, index) => {
            if (item.checked && !isGuest) completedCount++;

            // Check if the previous item is completed. If not, this item should be disabled.
            // Index 0 is always accessible if not in guest mode.
            const isPreviousCompleted = index === 0 ? true : checklistData[index - 1].checked;
            const isDisabled = isGuest || !isPreviousCompleted;

            const li = document.createElement('li');
            // If disabled, keep it looking slightly disabled or just prevent hover effects on checkbox
            li.className = `checklist-item flex flex-col p-2 rounded-lg ${isDisabled ? 'opacity-70' : 'hover:bg-gray-50 transition'} ${item.checked && !isGuest ? 'checked' : ''}`;
            
            const disabledAttr = isDisabled ? 'disabled' : '';
            const labelCursor = isDisabled ? 'cursor-not-allowed' : 'cursor-pointer';

            li.innerHTML = `
                <div class="flex items-center gap-3 w-full">
                    <input type="checkbox" id="${item.id}" class="custom-checkbox shrink-0" ${item.checked && !isGuest ? 'checked' : ''} ${disabledAttr}>
                    <label for="${item.id}" class="text-gray-700 ${labelCursor} flex-grow select-none">${item.text}</label>
                    <button class="instruction-toggle p-1 text-gray-400 hover:text-blue-500 focus:outline-none transition-transform shrink-0" aria-label="Show details">
                        <svg class="w-5 h-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
                <div class="instruction-content hidden mt-2 pl-8 pr-2 py-2 text-sm text-gray-600 bg-white border border-gray-100 rounded shadow-sm">
                    ${item.instruction}
                </div>
            `;

            // Checkbox event listener
            const checkbox = li.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                checklistData[index].checked = e.target.checked;
                // If unchecked, also uncheck all subsequent items
                if (!e.target.checked) {
                    for (let i = index + 1; i < checklistData.length; i++) {
                        checklistData[i].checked = false;
                    }
                }
                saveChecklist();
                renderChecklist(); // Re-render to update styles and progress
            });

            // Toggle instructions listener
            const toggleBtn = li.querySelector('.instruction-toggle');
            const contentDiv = li.querySelector('.instruction-content');
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent label click if any
                const isHidden = contentDiv.classList.contains('hidden');
                
                // Hide all others
                document.querySelectorAll('.instruction-content').forEach(el => el.classList.add('hidden'));
                document.querySelectorAll('.instruction-toggle svg').forEach(el => el.classList.remove('rotate-180'));

                if (isHidden) {
                    contentDiv.classList.remove('hidden');
                    toggleBtn.querySelector('svg').classList.add('rotate-180');
                }
            });

            checklistUl.appendChild(li);
        });

        // Update progress badge
        const progressPercentage = Math.round((completedCount / checklistData.length) * 100);
        checklistProgress.textContent = `${progressPercentage}%`;
        
        if (progressPercentage === 100) {
            checklistProgress.classList.replace('bg-blue-50', 'bg-green-100');
            checklistProgress.classList.replace('text-blue-600', 'text-green-700');
        } else {
            checklistProgress.classList.replace('bg-green-100', 'bg-blue-50');
            checklistProgress.classList.replace('text-green-700', 'text-blue-600');
        }
    }

    function saveChecklist() {
        localStorage.setItem('voterChecklist', JSON.stringify(checklistData));
    }


    /* --- Initialization --- */
    initWizard();
    loadTimeline();
    renderChecklist();
    renderChatHistory();

});
