 // ============ MAIN APPLICATION ============
document.addEventListener('DOMContentLoaded', function() {

    // ---- STATE ----
    var skills = [];
    var currentOutput = null;
    var currentFilter = 'all';

    // ---- DOM ELEMENTS ----
    var form = document.getElementById('outreachForm');
    var userName = document.getElementById('userName');
    var skillInput = document.getElementById('skillInput');
    var addSkillBtn = document.getElementById('addSkillBtn');
    var skillTags = document.getElementById('skillTags');
    var userSkills = document.getElementById('userSkills');
    var userBio = document.getElementById('userBio');
    var bioCharCount = document.getElementById('bioCharCount');
    var targetIndustry = document.getElementById('targetIndustry');
    var tonePref = document.getElementById('tonePref');
    var generateBtn = document.getElementById('generateBtn');

    var emptyState = document.getElementById('emptyState');
    var clientTargetCard = document.getElementById('clientTargetCard');
    var clientTargets = document.getElementById('clientTargets');
    var messageCard = document.getElementById('messageCard');
    var messageOutput = document.getElementById('messageOutput');
    var messageMeta = document.getElementById('messageMeta');
    var tipsCard = document.getElementById('tipsCard');
    var tipsList = document.getElementById('tipsList');
    var copyBtn = document.getElementById('copyBtn');
    var regenerateBtn = document.getElementById('regenerateBtn');
    var saveToTrackerBtn = document.getElementById('saveToTrackerBtn');

    var apiKeyBtn = document.getElementById('apiKeyBtn');
    var apiKeyStatus = document.getElementById('apiKeyStatus');
    var apiKeyModal = document.getElementById('apiKeyModal');
    var apiKeyInput = document.getElementById('apiKeyInput');
    var saveApiKeyBtn = document.getElementById('saveApiKey');
    var removeApiKeyBtn = document.getElementById('removeApiKey');
    var modalClose = document.getElementById('modalClose');
    var mobileApiKeyBtn = document.getElementById('mobileApiKeyBtn');

    var trackerTable = document.getElementById('trackerTable');
    var trackerEmpty = document.getElementById('trackerEmpty');
    var totalSent = document.getElementById('totalSent');
    var totalPending = document.getElementById('totalPending');
    var totalReplied = document.getElementById('totalReplied');
    var totalConverted = document.getElementById('totalConverted');
    var clearTrackerBtn = document.getElementById('clearTrackerBtn');

    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileMenu = document.getElementById('mobileMenu');
    var toastContainer = document.getElementById('toastContainer');

    // ---- INITIALIZE ----
    updateApiKeyUI();
    renderTracker();

    // ============ EVENT LISTENERS ============

    // --- Skills ---
    addSkillBtn.addEventListener('click', function() {
        addSkill();
    });

    skillInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });

    // Skill suggestion buttons
    var suggestionBtns = document.querySelectorAll('.skill-suggestion');
    for (var i = 0; i < suggestionBtns.length; i++) {
        suggestionBtns[i].addEventListener('click', function() {
            var skill = this.getAttribute('data-skill');
            if (skills.indexOf(skill) === -1) {
                skills.push(skill);
                renderSkillTags();
            }
        });
    }

    // --- Bio character count ---
    userBio.addEventListener('input', function() {
        var count = userBio.value.length;
        if (count > 300) {
            userBio.value = userBio.value.slice(0, 300);
            count = 300;
        }
        bioCharCount.textContent = count;
    });

    // --- Form Submit ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleGenerate();
    });

    // --- Output Actions ---
    copyBtn.addEventListener('click', handleCopy);
    regenerateBtn.addEventListener('click', function() {
        handleGenerate();
    });
    saveToTrackerBtn.addEventListener('click', handleSaveToTracker);

    // --- API Key Modal ---
    apiKeyBtn.addEventListener('click', openApiKeyModal);
    if (mobileApiKeyBtn) {
        mobileApiKeyBtn.addEventListener('click', openApiKeyModal);
    }
    saveApiKeyBtn.addEventListener('click', handleSaveApiKey);
    removeApiKeyBtn.addEventListener('click', handleRemoveApiKey);
    modalClose.addEventListener('click', closeApiKeyModal);
    apiKeyModal.addEventListener('click', function(e) {
        if (e.target === apiKeyModal) {
            closeApiKeyModal();
        }
    });

    // --- Tracker Filters ---
    var filterBtns = document.querySelectorAll('.filter-btn');
    for (var i = 0; i < filterBtns.length; i++) {
        filterBtns[i].addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            // Remove active from all
            var allBtns = document.querySelectorAll('.filter-btn');
            for (var j = 0; j < allBtns.length; j++) {
                allBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            renderTracker();
        });
    }

    clearTrackerBtn.addEventListener('click', function() {
        if (confirm('Clear all tracked outreach? This cannot be undone.')) {
            Tracker.clearAll();
            renderTracker();
            showToast('Tracker cleared', 'info');
        }
    });

    // --- Mobile Menu ---
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
    });

    var mobileLinks = document.querySelectorAll('.mobile-link');
    for (var i = 0; i < mobileLinks.length; i++) {
        mobileLinks[i].addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }

    // ============ FUNCTIONS ============

    // --- Add Skill ---
    function addSkill() {
        var value = skillInput.value.trim();
        if (value && skills.indexOf(value) === -1) {
            skills.push(value);
            skillInput.value = '';
            renderSkillTags();
        }
        skillInput.focus();
    }

    // --- Remove Skill ---
    function removeSkill(skill) {
        skills = skills.filter(function(s) { return s !== skill; });
        renderSkillTags();
    }

    // --- Render Skill Tags ---
    function renderSkillTags() {
        var html = '';
        for (var i = 0; i < skills.length; i++) {
            html += '<span class="skill-tag">' +
                escapeHtml(skills[i]) +
                ' <span class="skill-tag-remove" data-skill="' + escapeHtml(skills[i]) + '">&times;</span>' +
                '</span>';
        }
        skillTags.innerHTML = html;
        userSkills.value = skills.join(',');

        // Bind remove buttons
        var removeBtns = document.querySelectorAll('.skill-tag-remove');
        for (var i = 0; i < removeBtns.length; i++) {
            removeBtns[i].addEventListener('click', function() {
                removeSkill(this.getAttribute('data-skill'));
            });
        }
    }

    // --- Generate ---
    async function handleGenerate() {
        // Validate
        if (skills.length === 0) {
            showToast('Please add at least one skill', 'error');
            skillInput.focus();
            return;
        }

        var name = userName.value.trim();
        var bio = userBio.value.trim();
        var industry = targetIndustry.value;
        var outreachType = document.querySelector('input[name="outreachType"]:checked').value;
        var tone = tonePref.value;

        if (!name) {
            showToast('Please enter your name', 'error');
            userName.focus();
            return;
        }
        if (!bio) {
            showToast('Please enter a short bio', 'error');
            userBio.focus();
            return;
        }

        // Find matching clients
        var clients = ClientFinder.findClients(skills, industry);

        // Show loading
        setLoading(true);

        var data = {
            name: name,
            skills: skills,
            bio: bio,
            targetIndustry: industry,
            outreachType: outreachType,
            tone: tone,
            clients: clients
        };

        try {
            var result;

            if (ApiKeyManager.isSet()) {
                // Use Claude API
                result = await MessageGenerator.generateWithClaude(data);
                showToast('AI message generated successfully!', 'success');
            } else {
                // Use offline templates
                result = MessageGenerator.generateOffline(data);
                showToast('Using offline mode. Set API key for AI-powered messages.', 'info');
            }

            currentOutput = {
                subject: result.subject,
                message: result.message,
                tips: result.tips,
                targetClientType: result.targetClientType,
                estimatedResponseRate: result.estimatedResponseRate,
                name: name,
                skills: skills.slice(),
                bio: bio,
                outreachType: outreachType,
                tone: tone,
                clients: clients
            };

            renderOutput(result, clients, outreachType);

        } catch (error) {
            console.error('Generation error:', error);
            showToast(error.message, 'error');

            // Fallback to offline
            var fallbackResult = MessageGenerator.generateOffline(data);
            currentOutput = {
                subject: fallbackResult.subject,
                message: fallbackResult.message,
                tips: fallbackResult.tips,
                targetClientType: fallbackResult.targetClientType,
                estimatedResponseRate: fallbackResult.estimatedResponseRate,
                name: name,
                skills: skills.slice(),
                bio: bio,
                outreachType: outreachType,
                tone: tone,
                clients: clients
            };
            renderOutput(fallbackResult, clients, outreachType);
            showToast('Used offline template due to API error.', 'info');

        } finally {
            setLoading(false);
        }
    }

    // --- Render Output ---
    function renderOutput(result, clients, outreachType) {
        // Hide empty state
        emptyState.style.display = 'none';

        // Show client targets
        clientTargetCard.style.display = 'block';
        var clientHtml = '';
        for (var i = 0; i < clients.length; i++) {
            var c = clients[i];
            var tagsHtml = '';
            for (var j = 0; j < c.where.length; j++) {
                tagsHtml += '<span class="target-tag">📍 ' + escapeHtml(c.where[j]) + '</span>';
            }
            clientHtml += '<div class="client-target-card">' +
                '<h4>' + escapeHtml(c.type) + '</h4>' +
                '<p>' + escapeHtml(c.description) + '</p>' +
                '<div class="target-tags">' + tagsHtml + '</div>' +
                '</div>';
        }
        clientTargets.innerHTML = clientHtml;

        // Show message
        messageCard.style.display = 'block';
        messageOutput.innerHTML = '';

        if (result.subject && outreachType === 'email') {
            var subjectEl = document.createElement('div');
            subjectEl.style.marginBottom = '16px';
            subjectEl.style.paddingBottom = '12px';
            subjectEl.style.borderBottom = '1px solid #2a2a4a';
            subjectEl.innerHTML = '<strong style="color: #a29bfe;">Subject:</strong> ' + escapeHtml(result.subject);
            messageOutput.appendChild(subjectEl);
        }

        var messageText = document.createTextNode(result.message);
        var messagePre = document.createElement('div');
        messagePre.style.whiteSpace = 'pre-wrap';
        messagePre.appendChild(messageText);
        messageOutput.appendChild(messagePre);

        // Meta tags
        var typeIcon = outreachType === 'email' ? '📧' : outreachType === 'linkedin' ? '💼' : '🐦';
        messageMeta.innerHTML =
            '<span class="meta-tag">📊 Est. Response Rate: ' + escapeHtml(result.estimatedResponseRate) + '</span>' +
            '<span class="meta-tag">🎯 Target: ' + escapeHtml(result.targetClientType) + '</span>' +
            '<span class="meta-tag">' + typeIcon + ' ' + escapeHtml(outreachType) + '</span>';

        // Tips
        if (result.tips && result.tips.length > 0) {
            tipsCard.style.display = 'block';
            var tipIcons = ['🎯', '⏰', '📝', '🔄', '💡', '📊', '✨'];
            var tipsHtml = '';
            for (var i = 0; i < result.tips.length; i++) {
                tipsHtml += '<div class="tip-item">' +
                    '<span class="tip-icon">' + tipIcons[i % tipIcons.length] + '</span>' +
                    '<span>' + escapeHtml(result.tips[i]) + '</span>' +
                    '</div>';
            }
            tipsList.innerHTML = tipsHtml;
        }

        // Scroll to output on mobile
        if (window.innerWidth < 968) {
            clientTargetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // --- Copy Message ---
    function handleCopy() {
        if (!currentOutput) return;

        var text = '';
        if (currentOutput.subject) {
            text += 'Subject: ' + currentOutput.subject + '\n\n';
        }
        text += currentOutput.message;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                showToast('Message copied to clipboard!', 'success');
                copyBtn.textContent = '✅ Copied!';
                setTimeout(function() {
                    copyBtn.textContent = '📋 Copy';
                }, 2000);
            }).catch(function() {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('Message copied!', 'success');
            copyBtn.textContent = '✅ Copied!';
            setTimeout(function() {
                copyBtn.textContent = '📋 Copy';
            }, 2000);
        } catch (e) {
            showToast('Failed to copy. Please select and copy manually.', 'error');
        }
        document.body.removeChild(textarea);
    }

    // --- Save to Tracker ---
    function handleSaveToTracker() {
        if (!currentOutput) {
            showToast('Generate a message first!', 'error');
            return;
        }

        Tracker.add({
            clientType: currentOutput.targetClientType,
            skills: currentOutput.skills,
            outreachType: currentOutput.outreachType,
            message: currentOutput.message,
            subject: currentOutput.subject
        });

        renderTracker();
        showToast('Saved to tracker!', 'success');

        saveToTrackerBtn.textContent = '✅ Saved!';
        setTimeout(function() {
            saveToTrackerBtn.textContent = '💾 Save';
        }, 2000);
    }

    // --- Render Tracker ---
    function renderTracker() {
        var stats = Tracker.getStats();
        totalSent.textContent = stats.total;
        totalPending.textContent = stats.sent;
        totalReplied.textContent = stats.replied;
        totalConverted.textContent = stats.converted;

        var entries = Tracker.getFiltered(currentFilter);

        // Remove old rows
        var oldRows = document.querySelectorAll('.tracker-row');
        for (var i = 0; i < oldRows.length; i++) {
            oldRows[i].remove();
        }

        if (entries.length === 0) {
            trackerEmpty.style.display = 'block';
            return;
        }

        trackerEmpty.style.display = 'none';

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var row = document.createElement('div');
            row.className = 'tracker-row';
            row.setAttribute('data-id', entry.id);

            var dateObj = new Date(entry.date);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var dateStr = months[dateObj.getMonth()] + ' ' + dateObj.getDate();

            var statusClass = 'status-' + entry.status;
            var statusLabel = entry.status.charAt(0).toUpperCase() + entry.status.slice(1);
            var skillsStr = entry.skills.slice(0, 2).join(', ');

            row.innerHTML =
                '<div class="tracker-client">' + escapeHtml(entry.clientType) + '</div>' +
                '<div class="tracker-skill">' + escapeHtml(skillsStr) + '</div>' +
                '<div class="tracker-date">' + dateStr + '</div>' +
                '<div><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></div>' +
                '<div class="tracker-actions">' +
                    '<button class="tracker-action-btn" data-action="status" data-id="' + entry.id + '" title="Change status">📝</button>' +
                    '<button class="tracker-action-btn" data-action="delete" data-id="' + entry.id + '" title="Delete">🗑️</button>' +
                '</div>';

            trackerTable.appendChild(row);
        }

        // Bind tracker action buttons
        var actionBtns = document.querySelectorAll('.tracker-action-btn');
        for (var i = 0; i < actionBtns.length; i++) {
            actionBtns[i].addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                var action = this.getAttribute('data-action');

                if (action === 'delete') {
                    if (confirm('Delete this entry?')) {
                        Tracker.delete(id);
                        renderTracker();
                        showToast('Entry deleted', 'info');
                    }
                } else if (action === 'status') {
                    var statuses = ['sent', 'replied', 'converted'];
                    var allEntries = Tracker.getAll();
                    var entry = null;
                    for (var j = 0; j < allEntries.length; j++) {
                        if (allEntries[j].id === id) {
                            entry = allEntries[j];
                            break;
                        }
                    }
                    if (entry) {
                        var currentIdx = statuses.indexOf(entry.status);
                        var nextStatus = statuses[(currentIdx + 1) % statuses.length];
                        Tracker.updateStatus(id, nextStatus);
                        renderTracker();
                        showToast('Status changed to: ' + nextStatus, 'success');
                    }
                }
            });
        }
    }

    // --- API Key Modal ---
    function openApiKeyModal() {
        apiKeyModal.classList.add('active');
        apiKeyInput.value = ApiKeyManager.get();
        mobileMenu.classList.remove('active');
    }

    function closeApiKeyModal() {
        apiKeyModal.classList.remove('active');
    }

    function handleSaveApiKey() {
        var key = apiKeyInput.value.trim();
        if (!key) {
            showToast('Please enter an API key', 'error');
            return;
        }
        if (!ApiKeyManager.validate(key)) {
            showToast('Invalid API key format. Should start with sk-ant-', 'error');
            return;
        }
        ApiKeyManager.set(key);
        updateApiKeyUI();
        closeApiKeyModal();
        showToast('API key saved! AI generation is now active.', 'success');
    }

    function handleRemoveApiKey() {
        ApiKeyManager.remove();
        apiKeyInput.value = '';
        updateApiKeyUI();
        closeApiKeyModal();
        showToast('API key removed. Using offline mode.', 'info');
    }

    function updateApiKeyUI() {
        if (ApiKeyManager.isSet()) {
            apiKeyStatus.textContent = 'API Connected';
            apiKeyBtn.classList.add('connected');
        } else {
            apiKeyStatus.textContent = 'Set API Key';
            apiKeyBtn.classList.remove('connected');
        }
    }

    // --- Loading State ---
    function setLoading(isLoading) {
        var btnText = generateBtn.querySelector('.btn-text');
        var btnLoading = generateBtn.querySelector('.btn-loading');

        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.7';
        } else {
            btnText.style.display = 'inline-flex';
            btnLoading.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
        }
    }

    // --- Toast Notifications ---
    function showToast(message, type) {
        type = type || 'info';
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;

        var icons = { success: '✅', error: '❌', info: 'ℹ️' };
        var icon = icons[type] || 'ℹ️';
        toast.innerHTML = '<span>' + icon + '</span> ' + escapeHtml(message);

        toastContainer.appendChild(toast);

        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // --- Escape HTML ---
    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

});
