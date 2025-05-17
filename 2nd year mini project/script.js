document.addEventListener('DOMContentLoaded', function() {
            // State variables
            let isMonitoring = false;
            let intervalId = null;
            let checkInterval = 1000; // Default check interval in ms
            let darkMode = false;
            let showNotifications = true;
            
            // IDs counter for elements
            let nextId = 1;
            
            // Snippets collections
            const textSnippets = [];
            const urlSnippets = [];
            const imageSnippets = [];
            const noteSnippets = [];
            
            // DOM Elements
            const welcomeScreen = document.getElementById('welcome-screen');
            const mainApp = document.getElementById('main-app');
            const getStartedBtn = document.getElementById('get-started-btn');
            const startBtn = document.getElementById('start-btn');
            const stopBtn = document.getElementById('stop-btn');
            const exportBtn = document.getElementById('export-btn');
            const clearBtn = document.getElementById('clear-btn');
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            const settingsSection = document.getElementById('settings-section');
            const searchInput = document.getElementById('search-input');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content > div');
            const toastContainer = document.getElementById('toast-container');
            const addNoteBtn = document.getElementById('add-note-btn');
            const newNoteInput = document.getElementById('new-note');
            const noteTagsInput = document.getElementById('note-tags');
            const notePrioritySelect = document.getElementById('note-priority');
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            const themeToggle = document.getElementById('theme-toggle');
            const notificationsToggle = document.getElementById('notifications-toggle');
            const intervalSetting = document.getElementById('interval-setting');
            const textSnippetsContainer = document.getElementById('text-snippets');
            const urlSnippetsContainer = document.getElementById('url-snippets');
            const imageSnippetsContainer = document.getElementById('image-snippets');
            const notesSnippetsContainer = document.getElementById('notes-snippets');
            const textCountElement = document.getElementById('text-count');
            const urlCountElement = document.getElementById('url-count');
            const imageCountElement = document.getElementById('image-count');
            const notesCountElement = document.getElementById('notes-count');
            const pdfContainer = document.getElementById('pdf-container');
            const pdfFormatSelect = document.getElementById('pdf-format');
            
            // Initialization function
            function init() {
                bindEvents();
                loadSnippets();
                loadSettings();
                animateIcons();
                updateCounts();
            }
            
            // Bind all event listeners
            function bindEvents() {
                // Navigation between screens
                getStartedBtn.addEventListener('click', () => {
                    welcomeScreen.style.display = 'none';
                    mainApp.classList.add('show');
                });
                
                // Monitoring controls
                startBtn.addEventListener('click', startMonitoring);
                stopBtn.addEventListener('click', stopMonitoring);
                exportBtn.addEventListener('click', exportToPDF);
                clearBtn.addEventListener('click', clearAllSnippets);
                
                // Search and filter
                searchInput.addEventListener('input', filterSnippets);
                filterBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        filterSnippets();
                    });
                });
                
                // Tabs
                tabBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        tabBtns.forEach(b => b.classList.remove('active'));
                        tabContents.forEach(c => c.classList.remove('active'));
                        
                        btn.classList.add('active');
                        const tabId = btn.getAttribute('data-tab');
                        document.getElementById(`${tabId}-tab`).classList.add('active');
                    });
                });
                
                // Add note
                addNoteBtn.addEventListener('click', addNote);
                
                // Settings
                darkModeToggle.addEventListener('change', toggleDarkMode);
                themeToggle.addEventListener('click', () => {
                    darkModeToggle.checked = !darkModeToggle.checked;
                    toggleDarkMode();
                });
                
                notificationsToggle.addEventListener('change', () => {
                    showNotifications = notificationsToggle.checked;
                    saveSettings();
                });
                
                intervalSetting.addEventListener('change', () => {
                    checkInterval = parseInt(intervalSetting.value);
                    saveSettings();
                    if (isMonitoring) {
                        stopMonitoring();
                        startMonitoring();
                    }
                });
                
                // Prepare for clipboard monitoring
                document.addEventListener('paste', handlePaste);
                
                // Add keyboard shortcut for toggling settings
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.key === ',') {
                        toggleSettings();
                    }
                });
            }
            
            function toggleSettings() {
                if (settingsSection.style.display === 'none') {
                    settingsSection.style.display = 'block';
                    mainApp.classList.remove('show');
                } else {
                    settingsSection.style.display = 'none';
                    mainApp.classList.add('show');
                }
            }
            
            // Start the clipboard monitoring
            function startMonitoring() {
                isMonitoring = true;
                
                // Update UI
                statusDot.classList.add('active');
                statusText.textContent = 'Monitoring On';
                startBtn.disabled = true;
                stopBtn.disabled = false;
                
                // Start actual monitoring
                startClipboardMonitoring();
                
                // Notification
                showToast('Monitoring Started', 'Clipboard monitoring has been activated.', 'success');
                
                // Create some visual feedback
                createParticles();
            }
            
            // Stop the clipboard monitoring
            function stopMonitoring() {
                isMonitoring = false;
                
                // Clear any existing interval
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                
                // Update UI
                statusDot.classList.remove('active');
                statusText.textContent = 'Monitoring Off';
                startBtn.disabled = false;
                stopBtn.disabled = true;
                
                // Notification
                showToast('Monitoring Stopped', 'Clipboard monitoring has been deactivated.', 'info');
            }
            
            // Handle paste events for clipboard content
            function handlePaste(e) {
                if (!isMonitoring) return;
                
                console.log("Paste event detected!");
                const clipboardData = e.clipboardData || window.clipboardData;
                
                if (!clipboardData) {
                    console.log("No clipboard data available");
                    return;
                }
                
                console.log("Clipboard has " + clipboardData.items.length + " items");
                
                // Check for image content
                for (let i = 0; i < clipboardData.items.length; i++) {
                    console.log("Item " + i + " type: " + clipboardData.items[i].type);
                    
                    if (clipboardData.items[i].type.indexOf("image") !== -1) {
                        console.log("Found image in clipboard");
                        const blob = clipboardData.items[i].getAsFile();
                        const reader = new FileReader();
                        
                        reader.onload = function(event) {
                            console.log("Image loaded as data URL");
                            const imageDataUrl = event.target.result;
                            addSnippet('image', imageDataUrl);
                        };
                        
                        reader.readAsDataURL(blob);
                        break;
                    }
                }
                
                // Check for text content
                const text = clipboardData.getData('text');
                if (text) {
                    if (isValidUrl(text)) {
                        console.log("URL detected: " + text);
                        addSnippet('url', text);
                    } else {
                        console.log("Text detected: " + text.substring(0, 30) + (text.length > 30 ? "..." : ""));
                        addSnippet('text', text);
                    }
                }
            }
            
            // Export all snippets to PDF
            function exportToPDF() {
                // Show loading toast
                const loadingToastId = showToast('Preparing PDF', 'Generating your PDF document...', 'info', true);
                
                try {
                    // Create a PDF document
                    pdfContainer.innerHTML = '';
                    pdfContainer.style.display = 'block';
                    
                    // Create PDF content structure
                    const pdfContent = document.createElement('div');
                    pdfContent.className = 'pdf-content';
                    pdfContainer.appendChild(pdfContent);
                    
                    // Add header
                    const headerDiv = document.createElement('div');
                    headerDiv.className = 'pdf-header';
                    headerDiv.innerHTML = `
                        <h1 class="pdf-title">Smart Snip Pro - Snippets Export</h1>
                        <p class="pdf-date">Generated on ${new Date().toLocaleString()}</p>
                    `;
                    pdfContent.appendChild(headerDiv);
                    
                    // Add text snippets section
                    if (textSnippets.length > 0) {
                        const textSection = createPdfSection('Text Snippets', textSnippets);
                        pdfContent.appendChild(textSection);
                    }
                    
                    // Add URL snippets section
                    if (urlSnippets.length > 0) {
                        const urlSection = createPdfSection('URL Snippets', urlSnippets, 'url');
                        pdfContent.appendChild(urlSection);
                    }
                    
                    // Add image snippets section
                    if (imageSnippets.length > 0) {
                        const imageSection = createPdfSection('Image Snippets', imageSnippets, 'image');
                        pdfContent.appendChild(imageSection);
                    }
                    
                    // Add notes section
                    if (noteSnippets.length > 0) {
                        const notesSection = createPdfSection('Notes & Tags', noteSnippets, 'note');
                        pdfContent.appendChild(notesSection);
                    }
                    
                    // Use HTML2Canvas and jsPDF for PDF generation
                    setTimeout(() => {
                        const pdfFormat = pdfFormatSelect.value;
                        let format;
                        
                        if (pdfFormat === 'a4') {
                            format = [210, 297];
                        } else if (pdfFormat === 'letter') {
                            format = [216, 279];
                        } else if (pdfFormat === 'legal') {
                            format = [216, 356];
                        }
                        
                        html2canvas(pdfContent, {
                            scale: 2,
                            useCORS: true,
                            logging: true
                        }).then(canvas => {
                            const imgData = canvas.toDataURL('image/jpeg', 1.0);
                            const pdf = new jspdf.jsPDF({
                                orientation: 'portrait',
                                unit: 'mm',
                                format: format
                            });
                            
                            const imgWidth = pdf.internal.pageSize.getWidth() - 20;
                            const imgHeight = (canvas.height * imgWidth) / canvas.width;
                            
                            let heightLeft = imgHeight;
                            let position = 10;
                            let page = 1;
                            
                            // Add first page
                            pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                            heightLeft -= (pdf.internal.pageSize.getHeight() - 20);
                            
                            // Add subsequent pages if needed
                            while (heightLeft > 0) {
                                position = 10 - (pdf.internal.pageSize.getHeight() - 20) * page;
                                pdf.addPage();
                                pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                                heightLeft -= (pdf.internal.pageSize.getHeight() - 20);
                                page++;
                            }
                            
                            // Save PDF
                            pdf.save('smart-snip-pro-export.pdf');
                            
                            // Clean up
                            pdfContainer.style.display = 'none';
                            
                            // Update toast notification
                            updateToast(loadingToastId, 'PDF Exported', 'Your snippets have been exported to PDF successfully.', 'success');
                            
                            // Add celebratory effect
                            generateConfetti();
                        }).catch(err => {
                            console.error('Error generating PDF:', err);
                            updateToast(loadingToastId, 'Export Failed', 'There was an error generating the PDF: ' + err.message, 'error');
                            pdfContainer.style.display = 'none';
                        });
                    }, 500);
                    
                } catch (error) {
                    console.error('Error generating PDF: ', error);
                    updateToast(loadingToastId, 'Export Failed', 'There was an error generating the PDF: ' + error.message, 'error');
                    pdfContainer.style.display = 'none';
                }
            }
            
            // Helper function to create PDF sections
            function createPdfSection(title, snippets, type = 'text') {
                const section = document.createElement('div');
                section.className = 'pdf-section';
                
                const sectionTitle = document.createElement('h2');
                sectionTitle.className = 'pdf-section-title';
                sectionTitle.textContent = title;
                section.appendChild(sectionTitle);
                
                snippets.forEach(snippet => {
                    const item = document.createElement('div');
                    item.className = 'pdf-item';
                    
                    const itemDate = document.createElement('div');
                    itemDate.className = 'pdf-item-date';
                    itemDate.textContent = snippet.date;
                    item.appendChild(itemDate);
                    
                    if (type === 'image') {
                        const img = document.createElement('img');
                        img.className = 'pdf-item-image';
                        img.src = snippet.content;
                        img.alt = 'Captured image';
                        item.appendChild(img);
                    } else if (type === 'url') {
                        const link = document.createElement('a');
                        link.href = snippet.content;
                        link.textContent = snippet.content;
                        link.style.color = '#4a6ee0';
                        link.style.wordBreak = 'break-all';
                        item.appendChild(link);
                    } else if (type === 'note') {
                        // Get priority color
                        let priorityColor = '#f39c12'; // Default medium
                        if (snippet.priority === 'high') priorityColor = '#e74c3c';
                        if (snippet.priority === 'low') priorityColor = '#2ecc71';
                        
                        // Create priority badge
                        const priorityBadge = document.createElement('span');
                        priorityBadge.style.padding = '3px 8px';
                        priorityBadge.style.borderRadius = '15px';
                        priorityBadge.style.fontSize = '12px';
                        priorityBadge.style.fontWeight = 'bold';
                        priorityBadge.style.color = priorityColor;
                        priorityBadge.style.backgroundColor = `rgba(${snippet.priority === 'high' ? '231, 76, 60, 0.1' : snippet.priority === 'medium' ? '243, 156, 18, 0.1' : '46, 204, 113, 0.1'})`;
                        priorityBadge.textContent = snippet.priority.charAt(0).toUpperCase() + snippet.priority.slice(1);
                        item.appendChild(priorityBadge);
                        
                        // Add content
                        const content = document.createElement('div');
                        content.className = 'pdf-item-content';
                        content.style.marginTop = '10px';
                        content.textContent = snippet.content;
                        item.appendChild(content);
                        
                        // Add tags if they exist
                        if (snippet.tags) {
                            const tagsContainer = document.createElement('div');
                            tagsContainer.style.marginTop = '10px';
                            
                            snippet.tags.split(',').forEach(tag => {
                                const tagSpan = document.createElement('span');
                                tagSpan.style.display = 'inline-block';
                                tagSpan.style.padding = '3px 8px';
                                tagSpan.style.backgroundColor = '#f0f4ff';
                                tagSpan.style.borderRadius = '15px';
                                tagSpan.style.fontSize = '12px';
                                tagSpan.style.marginRight = '5px';
                                tagSpan.style.marginBottom = '5px';
                                tagSpan.style.color = '#4a6ee0';
                                tagSpan.textContent = tag.trim();
                                tagsContainer.appendChild(tagSpan);
                            });
                            
                            item.appendChild(tagsContainer);
                        }
                    } else {
                        const content = document.createElement('div');
                        content.className = 'pdf-item-content';
                        content.textContent = snippet.content;
                        item.appendChild(content);
                    }
                    
                    section.appendChild(item);
                });
                
                return section;
            }
            
            // Animation effects
            function animateIcons() {
                const icons = document.querySelectorAll('.feature-icon');
                setInterval(() => {
                    icons.forEach(icon => {
                        icon.style.animation = 'none';
                        icon.offsetHeight; // Trigger reflow
                        icon.style.animation = 'float 3s infinite ease-in-out';
                    });
                }, 3000);
            }
            
            function createParticles() {
                const particlesContainer = document.getElementById('particles-container');
                particlesContainer.innerHTML = ''; // Clear any existing particles
                
                const colors = ['#4a6ee0', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];
                
                for (let i = 0; i < 50; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    
                    // Random properties
                    const size = Math.random() * 8 + 4; // 4-12px
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const left = Math.random() * 100; // 0-100%
                    const duration = Math.random() * 2 + 1; // 1-3s
                    const delay = Math.random() * 0.5; // 0-0.5s
                    
                    // Apply styles
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.backgroundColor = color;
                    particle.style.left = `${left}%`;
                    particle.style.top = '-20px';
                    particle.style.animationDuration = `${duration}s`;
                    particle.style.animationDelay = `${delay}s`;
                    
                    particlesContainer.appendChild(particle);
                    
                    // Remove particle after animation
                    setTimeout(() => {
                        if (particlesContainer.contains(particle)) {
                            particlesContainer.removeChild(particle);
                        }
                    }, (duration + delay) * 1000);
                }
            }
            
            function generateConfetti() {
                const particlesContainer = document.getElementById('particles-container');
                particlesContainer.innerHTML = ''; // Clear any existing particles
                
                const colors = ['#4a6ee0', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#f1c40f', '#1abc9c', '#3498db'];
                
                for (let i = 0; i < 100; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'particle';
                    
                    // Random properties
                    const isRect = Math.random() > 0.5;
                    const size = Math.random() * 10 + 5; // 5-15px
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const left = Math.random() * 100; // 0-100%
                    const duration = Math.random() * 3 + 2; // 2-5s
                    const delay = Math.random() * 0.5; // 0-0.5s
                    const rotation = Math.random() * 360; // 0-360deg
                    
                    // Apply styles
                    confetti.style.width = isRect ? `${size / 2}px` : `${size}px`;
                    confetti.style.height = `${size}px`;
                    confetti.style.backgroundColor = color;
                    confetti.style.left = `${left}%`;
                    confetti.style.top = `-${size}px`;
                    confetti.style.animationDuration = `${duration}s`;
                    confetti.style.animationDelay = `${delay}s`;
                    confetti.style.transform = `rotate(${rotation}deg)`;
                    confetti.style.borderRadius = isRect ? '0' : '50%';
                    
                    particlesContainer.appendChild(confetti);
                    
                    // Remove confetti after animation
                    setTimeout(() => {
                        if (particlesContainer.contains(confetti)) {
                            particlesContainer.removeChild(confetti);
                        }
                    }, (duration + delay) * 1000);
                }
                
                // Add floating celebration message
                const message = document.createElement('div');
                message.textContent = '🎉 PDF Successfully Exported! 🎉';
                message.style.position = 'fixed';
                message.style.top = '50%';
                message.style.left = '50%';
                message.style.transform = 'translate(-50%, -50%)';
                message.style.fontSize = '24px';
                message.style.fontWeight = 'bold';
                message.style.color = '#4a6ee0';
                message.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                message.style.padding = '20px';
                message.style.borderRadius = '10px';
                message.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
                message.style.zIndex = '9999';
                message.style.animation = 'pulse 2s infinite';
                
                document.body.appendChild(message);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    document.body.removeChild(message);
                }, 3000);
            }
            
            // Utility function for random color generation
            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }
            
            // Load and save snippets from localStorage
            function loadSnippets() {
                try {
                    const savedTextSnippets = JSON.parse(localStorage.getItem('textSnippets')) || [];
                    const savedUrlSnippets = JSON.parse(localStorage.getItem('urlSnippets')) || [];
                    const savedImageSnippets = JSON.parse(localStorage.getItem('imageSnippets')) || [];
                    const savedNoteSnippets = JSON.parse(localStorage.getItem('noteSnippets')) || [];
                    
                    // Get the latest ID to continue from
                    const allSnippets = [...savedTextSnippets, ...savedUrlSnippets, ...savedImageSnippets, ...savedNoteSnippets];
                    if (allSnippets.length > 0) {
                        const maxId = Math.max(...allSnippets.map(s => s.id || 0));
                        nextId = maxId + 1;
                    }
                    
                    // Load text snippets
                    savedTextSnippets.forEach(snippet => {
                        textSnippets.push(snippet);
                        renderSnippet(snippet, textSnippetsContainer, 'text');
                    });
                    
                    // Load URL snippets
                    savedUrlSnippets.forEach(snippet => {
                        urlSnippets.push(snippet);
                        renderSnippet(snippet, urlSnippetsContainer, 'url');
                    });
                    
                    // Load image snippets
                    savedImageSnippets.forEach(snippet => {
                        imageSnippets.push(snippet);
                        renderSnippet(snippet, imageSnippetsContainer, 'image');
                    });
                    
                    // Load note snippets
                    savedNoteSnippets.forEach(snippet => {
                        noteSnippets.push(snippet);
                        renderSnippet(snippet, notesSnippetsContainer, 'note');
                    });
                    
                    // Update UI
                    updateCounts();
                    
                    // Show notification only if there are snippets
                    if (allSnippets.length > 0) {
                        showToast('Snippets Loaded', `Loaded ${allSnippets.length} snippets from storage.`, 'info');
                    }
                } catch (error) {
                    console.error('Error loading snippets: ', error);
                    showToast('Error', 'Failed to load saved snippets.', 'error');
                }
            }
            
            function saveSnippets() {
                try {
                    localStorage.setItem('textSnippets', JSON.stringify(textSnippets));
                    localStorage.setItem('urlSnippets', JSON.stringify(urlSnippets));
                    localStorage.setItem('imageSnippets', JSON.stringify(imageSnippets));
                    localStorage.setItem('noteSnippets', JSON.stringify(noteSnippets));
                } catch (error) {
                    console.error('Error saving snippets: ', error);
                    showToast('Error', 'Failed to save snippets.', 'error');
                }
            }
            
            function loadSettings() {
                try {
                    const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
                    
                    // Apply dark mode if saved
                    darkMode = settings.darkMode || false;
                    darkModeToggle.checked = darkMode;
                    if (darkMode) document.body.classList.add('dark-mode');
                    
                    // Apply notification setting
                    showNotifications = settings.showNotifications !== undefined ? settings.showNotifications : true;
                    notificationsToggle.checked = showNotifications;
                    
                    // Apply check interval
                    checkInterval = settings.checkInterval || 1000;
                    intervalSetting.value = checkInterval;
                } catch (error) {
                    console.error('Error loading settings: ', error);
                }
            }
            
            function saveSettings() {
                try {
                    const settings = {
                        darkMode,
                        showNotifications,
                        checkInterval
                    };
                    localStorage.setItem('appSettings', JSON.stringify(settings));
                } catch (error) {
                    console.error('Error saving settings: ', error);
                }
            }
            
            function toggleDarkMode() {
                darkMode = darkModeToggle.checked;
                if (darkMode) {
                    document.body.classList.add('dark-mode');
                    themeToggle.textContent = '🌙';
                } else {
                    document.body.classList.remove('dark-mode');
                    themeToggle.textContent = '☀️';
                }
                saveSettings();
            }
            
            // Clear all snippets
            function clearAllSnippets() {
                // Ask for confirmation
                const confirmClear = confirm('Are you sure you want to clear all snippets? This cannot be undone.');
                
                if (confirmClear) {
                    // Clear arrays
                    textSnippets.length = 0;
                    urlSnippets.length = 0;
                    imageSnippets.length = 0;
                    noteSnippets.length = 0;
                    
                    // Clear DOM
                    textSnippetsContainer.innerHTML = '<div class="empty-message">No text snippets yet. Start monitoring to capture clipboard content.</div>';
                    urlSnippetsContainer.innerHTML = '<div class="empty-message">No URL snippets yet. Start monitoring to capture clipboard content.</div>';
                    imageSnippetsContainer.innerHTML = '<div class="empty-message">No image snippets yet. Start monitoring to capture clipboard content.</div>';
                    notesSnippetsContainer.innerHTML = '<div class="empty-message">No notes yet. Use the form above to add notes.</div>';
                    
                    // Save to storage
                    saveSnippets();
                    
                    // Update UI
                    updateCounts();
                    
                    // Show toast
                    showToast('All Cleared', 'All snippets have been cleared.', 'info');
                }
            }
            
            // Add a new snippet
            function addSnippet(type, content, tags = '', priority = 'medium') {
                // Create new snippet object
                const snippet = {
                    id: nextId++,
                    content,
                    date: new Date().toLocaleString(),
                    tags,
                    priority
                };
                
                // Add to appropriate array
                switch (type) {
                    case 'text':
                        // Check for duplicates
                        if (textSnippets.some(s => s.content === content)) {
                            console.log('Duplicate text snippet, skipping');
                            return;
                        }
                        
                        textSnippets.unshift(snippet);
                        renderSnippet(snippet, textSnippetsContainer, 'text');
                        break;
                        
                    case 'url':
                        // Check for duplicates
                        if (urlSnippets.some(s => s.content === content)) {
                            console.log('Duplicate URL snippet, skipping');
                            return;
                        }
                        
                        urlSnippets.unshift(snippet);
                        renderSnippet(snippet, urlSnippetsContainer, 'url');
                        break;
                        
                    case 'image':
                        // For images, we can't easily check for duplicates
                        imageSnippets.unshift(snippet);
                        renderSnippet(snippet, imageSnippetsContainer, 'image');
                        break;
                        
                    case 'note':
                        noteSnippets.unshift(snippet);
                        renderSnippet(snippet, notesSnippetsContainer, 'note');
                        break;
                }
                
                // Save to storage
                saveSnippets();
                
                // Update UI
                updateCounts();
                
                // Show toast notification
                if (showNotifications) {
                    showToast('New Snippet Added', `A new ${type} snippet has been captured.`, 'success');
                }
                
                return snippet;
            }
            
            // Add a note
            function addNote() {
                const content = newNoteInput.value.trim();
                const tags = noteTagsInput.value.trim();
                const priority = notePrioritySelect.value;
                
                if (content) {
                    addSnippet('note', content, tags, priority);
                    
                    // Clear inputs
                    newNoteInput.value = '';
                    noteTagsInput.value = '';
                    notePrioritySelect.value = 'medium';
                } else {
                    showToast('Empty Note', 'Please enter some content for your note.', 'warning');
                }
            }
            
            // Render a snippet in the DOM
            function renderSnippet(snippet, container, type) {
                // Check if there's an empty message
                const emptyMessage = container.querySelector('.empty-message');
                if (emptyMessage) container.removeChild(emptyMessage);
                
                // Create snippet element
                const snippetElement = document.createElement('div');
                snippetElement.className = `snippet ${type === 'note' ? 'note-snippet' : ''}`;
                snippetElement.dataset.id = snippet.id;
                snippetElement.dataset.type = type;
                
                let contentHtml = '';
                
                switch (type) {
                    case 'text':
                        contentHtml = `<div class="snippet-content">${snippet.content}</div>`;
                        break;
                        
                    case 'url':
                        contentHtml = `<div class="snippet-content"><a href="${snippet.content}" target="_blank">${snippet.content}</a></div>`;
                        break;
                        
                    case 'image':
                        contentHtml = `<div class="snippet-content"><img src="${snippet.content}" alt="Captured image"></div>`;
                        break;
                        
                    case 'note':
                        // Format tags
                        const tagsHtml = snippet.tags ? 
                            `<div class="tags-container">
                                ${snippet.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                            </div>` : '';
                        
                        // Get priority badge
                        const priorityBadge = `<span class="priority-badge priority-${snippet.priority}">${snippet.priority.charAt(0).toUpperCase() + snippet.priority.slice(1)}</span>`;
                        
                        contentHtml = `
                            <div class="note-meta">
                                ${tagsHtml}
                                ${priorityBadge}
                            </div>
                            <div class="snippet-content">${snippet.content}</div>
                        `;
                        break;
                }
                
                snippetElement.innerHTML = `
                    <div class="snippet-header">
                        <h4 class="snippet-title">${type.charAt(0).toUpperCase() + type.slice(1)} Snippet</h4>
                        <span class="snippet-date">${snippet.date}</span>
                    </div>
                    ${contentHtml}
                    <div class="snippet-actions">
                        ${type === 'text' || type === 'url' ? `<button class="snippet-btn copy-btn" data-content="${encodeURIComponent(snippet.content)}" data-type="${type}">Copy</button>` : ''}
                        <button class="snippet-btn delete-btn" data-id="${snippet.id}" data-type="${type}">Delete</button>
                    </div>
                `;
                
                // Add click handler for delete button
                const deleteBtn = snippetElement.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', function() {
                    showDeleteConfirmation(this.dataset.id, this.dataset.type, snippetElement);
                });
                
                // Add click handler for copy button
                const copyBtn = snippetElement.querySelector('.copy-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', function() {
                        copyToClipboard(this.dataset.content, this.dataset.type);
                    });
                }
                
                // Add to container
                container.insertBefore(snippetElement, container.firstChild);
                
                // Add fade-in animation
                snippetElement.style.opacity = '0';
                snippetElement.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    snippetElement.style.opacity = '1';
                    snippetElement.style.transform = 'translateY(0)';
                }, 10);
            }
            
            // Update the counts in the dashboard
            function updateCounts() {
                textCountElement.textContent = textSnippets.length;
                urlCountElement.textContent = urlSnippets.length;
                imageCountElement.textContent = imageSnippets.length;
                notesCountElement.textContent = noteSnippets.length;
                
                // Animate the numbers
                [textCountElement, urlCountElement, imageCountElement, notesCountElement].forEach(el => {
                    el.style.animation = 'none';
                    el.offsetHeight; // Trigger reflow
                    el.style.animation = 'pulse 0.5s';
                });
            }
            
            // Filter snippets based on search input and active filter
            function filterSnippets() {
                const searchTerm = searchInput.value.toLowerCase();
                const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
                
                // Helper function to filter a specific list
                const filterList = (snippets, container, type) => {
                    // Skip if this type is not relevant to the active filter
                    if (activeFilter !== 'all' && activeFilter !== type) return;
                    
                    const snippetElements = container.querySelectorAll('.snippet');
                    
                    if (snippetElements.length === 0 && snippets.length === 0) {
                        // Nothing to filter, keep the empty message
                        return;
                    }
                    
                    if (snippetElements.length === 0 && snippets.length > 0) {
                        // There are snippets but none rendered, render them all
                        snippets.forEach(snippet => renderSnippet(snippet, container, type));
                    }
                    
                    // Filter the visible snippets
                    snippetElements.forEach(element => {
                        const snippet = snippets.find(s => s.id == element.dataset.id);
                        if (!snippet) return;
                        
                        let visible = true;
                        
                        // Apply search filter
                        if (searchTerm) {
                            const content = snippet.content.toLowerCase();
                            const date = snippet.date.toLowerCase();
                            let tags = '';
                            
                            if (type === 'note' && snippet.tags) {
                                tags = snippet.tags.toLowerCase();
                            }
                            
                            visible = content.includes(searchTerm) || date.includes(searchTerm) || tags.includes(searchTerm);
                        }
                        
                        element.style.display = visible ? 'block' : 'none';
                    });
                    
                    // Check if any snippets are visible
                    const visibleSnippets = Array.from(snippetElements).filter(el => el.style.display !== 'none');
                    
                    // Add or remove empty message
                    const emptyMessage = container.querySelector('.empty-message');
                    
                    if (visibleSnippets.length === 0) {
                        if (!emptyMessage) {
                            const message = document.createElement('div');
                            message.className = 'empty-message';
                            message.textContent = searchTerm ? 
                                'No matching snippets found. Try a different search term.' : 
                                `No ${type} snippets yet. Start monitoring to capture clipboard content.`;
                            container.appendChild(message);
                        } else if (searchTerm) {
                            emptyMessage.textContent = 'No matching snippets found. Try a different search term.';
                        }
                    } else if (emptyMessage) {
                        container.removeChild(emptyMessage);
                    }
                };
                
                // Apply filtering to each list
                filterList(textSnippets, textSnippetsContainer, 'text');
                filterList(urlSnippets, urlSnippetsContainer, 'url');
                filterList(imageSnippets, imageSnippetsContainer, 'image');
                filterList(noteSnippets, notesSnippetsContainer, 'note');
            }
            
            // Show delete confirmation
            function showDeleteConfirmation(id, type, snippetElement) {
                // Check if there's already a confirmation shown
                const existingConfirm = snippetElement.querySelector('.delete-confirm');
                if (existingConfirm) return;
                
                // Create confirmation element
                const confirmElement = document.createElement('div');
                confirmElement.className = 'delete-confirm';
                confirmElement.innerHTML = `
                    <div class="delete-confirm-message">Are you sure you want to delete this snippet?</div>
                    <div class="delete-confirm-buttons">
                        <button class="confirm-btn confirm-yes">Yes</button>
                        <button class="confirm-btn confirm-no">No</button>
                    </div>
                `;
                
                // Add to snippet
                snippetElement.appendChild(confirmElement);
                // Show with animation
                setTimeout(() => {
                    confirmElement.classList.add('show');
                }, 10);
                
                // Add event listeners
                const confirmBtn = confirmElement.querySelector('.confirm-yes');
                const cancelBtn = confirmElement.querySelector('.confirm-no');
                
                confirmBtn.addEventListener('click', () => {
                    // Find and remove the snippet from the array
                    let snippetArray;
                    switch (type) {
                        case 'text':
                            snippetArray = textSnippets;
                            break;
                        case 'url':
                            snippetArray = urlSnippets;
                            break;
                        case 'image':
                            snippetArray = imageSnippets;
                            break;
                        case 'note':
                            snippetArray = noteSnippets;
                            break;
                    }
                    
                    const index = snippetArray.findIndex(s => s.id == id);
                    if (index !== -1) {
                        snippetArray.splice(index, 1);
                        saveSnippets();
                    }
                    
                    // Remove the snippet element with animation
                    snippetElement.style.transform = 'translateX(100%)';
                    snippetElement.style.opacity = '0';
                    
                    setTimeout(() => {
                        if (snippetElement.parentNode) {
                            snippetElement.parentNode.removeChild(snippetElement);
                        }
                        updateCounts();
                        filterSnippets();
                        showToast('Snippet Deleted', 'The snippet has been removed', 'info');
                    }, 500);
                });
                
                cancelBtn.addEventListener('click', () => {
                    // Hide and remove the confirmation
                    confirmElement.style.transform = 'translateY(100%)';
                    confirmElement.style.opacity = '0';
                    setTimeout(() => {
                        snippetElement.removeChild(confirmElement);
                    }, 300);
                });
            }
            
            // Copy to clipboard function with improved feedback
            function copyToClipboard(content, type) {
                const decoded = decodeURIComponent(content);
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(decoded)
                        .then(() => {
                            showToast('Copied to Clipboard', `${type === 'text' ? 'Text' : 'URL'} has been copied to clipboard`, 'success');
                        })
                        .catch(err => {
                            console.error('Failed to copy: ', err);
                            fallbackCopyToClipboard(decoded, type);
                        });
                } else {
                    fallbackCopyToClipboard(decoded, type);
                }
            }
            
            // Fallback copy method for browsers that don't support navigator.clipboard
            function fallbackCopyToClipboard(text, type) {
                // Create a temporary element to hold the content for copying
                const temp = document.createElement('textarea');
                temp.value = text;
                temp.style.position = 'fixed';
                temp.style.left = '-9999px';
                document.body.appendChild(temp);
                temp.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        showToast('Copied to Clipboard', `${type === 'text' ? 'Text' : 'URL'} has been copied to clipboard`, 'success');
                    } else {
                        showToast('Copy Failed', 'Unable to copy to clipboard', 'error');
                    }
                } catch (err) {
                    console.error('Failed to copy: ', err);
                    showToast('Copy Failed', 'Unable to copy to clipboard', 'error');
                }
                
                document.body.removeChild(temp);
            }
            
            // Toast notification system
            function showToast(title, message, type = 'info', persistent = false, duration = 3000) {
                if (!showNotifications && !persistent) return;
                
                const id = Date.now();
                
                // Create toast element
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                toast.dataset.id = id;
                
                // Icon based on type
                let icon = '';
                switch (type) {
                    case 'success':
                        icon = '✓';
                        break;
                    case 'error':
                        icon = '✗';
                        break;
                    case 'warning':
                        icon = '⚠';
                        break;
                    default:
                        icon = 'ℹ';
                }
                
                toast.innerHTML = `
                    <div class="toast-icon">${icon}</div>
                    <div class="toast-content">
                        <div class="toast-title">${title}</div>
                        <div class="toast-message">${message}</div>
                    </div>
                    <button class="toast-close">&times;</button>
                `;
                
                toastContainer.appendChild(toast);
                
                // Animation timing
                setTimeout(() => toast.classList.add('show'), 50);
                
                // Add close button functionality
                const closeBtn = toast.querySelector('.toast-close');
                closeBtn.addEventListener('click', () => {
                    toast.classList.add('hide');
                    setTimeout(() => toast.remove(), 500);
                });
                
                // Auto-remove toast after duration
                if (!persistent && duration) {
                    setTimeout(() => {
                        if (document.querySelector(`.toast[data-id="${id}"]`)) {
                            toast.classList.add('hide');
                            setTimeout(() => toast.remove(), 500);
                        }
                    }, duration);
                }
                
                return id; // Return ID for potential later reference
            }
            
            // Function to update a toast
            function updateToast(id, title, message, type) {
                const toast = document.querySelector(`.toast[data-id="${id}"]`);
                if (toast) {
                    const titleEl = toast.querySelector('.toast-title');
                    const messageEl = toast.querySelector('.toast-message');
                    const iconEl = toast.querySelector('.toast-icon');
                    
                    // Update content
                    if (titleEl) titleEl.textContent = title;
                    if (messageEl) messageEl.textContent = message;
                    
                    // Update icon
                    if (iconEl) {
                        let icon = '';
                        switch (type) {
                            case 'success':
                                icon = '✓';
                                break;
                            case 'error':
                                icon = '✗';
                                break;
                            default:
                                icon = 'ℹ';
                        }
                        iconEl.textContent = icon;
                    }
                    
                    // Update class
                    toast.className = `toast ${type} show`;
                    
                    // Add a pulse animation to indicate update
                    toast.style.animation = 'pulse 0.5s';
                    setTimeout(() => {
                        toast.style.animation = '';
                    }, 500);
                }
            }
            
            // Real clipboard monitoring function with image capture support
            function startClipboardMonitoring() {
                console.log("Starting clipboard monitoring...");
                
                // Initialize actual clipboard monitoring
                const checkClipboard = async () => {
                    if (!isMonitoring) return;
                    try {
                        // Try to read text from clipboard
                        const text = await navigator.clipboard.readText().catch(() => null);
                        
                        if (text) {
                            console.log("Clipboard content detected: ", text.substring(0, 30) + (text.length > 30 ? "..." : ""));
                            
                            // Check if it's a URL or plain text
                            if (isValidUrl(text)) {
                                // Check if it's an image URL
                                if (text.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
                                    console.log("Detected image URL in clipboard");
                                    // Add as image instead of URL
                                    const img = new Image();
                                    img.onload = function() {
                                        // Create a canvas to get the data URL
                                        const canvas = document.createElement('canvas');
                                        canvas.width = img.width;
                                        canvas.height = img.height;
                                        const ctx = canvas.getContext('2d');
                                        ctx.drawImage(img, 0, 0);
                                        const dataUrl = canvas.toDataURL('image/png');
                                        
                                        addSnippet('image', dataUrl);
                                    };
                                    img.onerror = function() {
                                        // If image loading fails, just add as URL
                                        addSnippet('url', text);
                                    };
                                    img.src = text;
                                } else {
                                    addSnippet('url', text);
                                }
                            } else {
                                addSnippet('text', text);
                            }
                        }
                    } catch (error) {
                        console.log("Error reading clipboard:", error);
                    }
                };
                
                // Start the interval
                checkClipboard(); // Initial check
                intervalId = setInterval(checkClipboard, checkInterval);
            }
            
            // Helper function to check if a string is a valid URL
            function isValidUrl(string) {
                try {
                    new URL(string);
                    return true;
                } catch (_) {
                    return false;
                }
            }
            
            // Initialize the app
            init();
        });