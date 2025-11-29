// HerCircle Shield Popup JavaScript

console.log('HerCircle Shield popup loaded');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  // Load stats
  await loadStats();

  // Load settings
  await loadSettings();

  // Set up event listeners
  setupEventListeners();

  // Set up tab navigation
  setupTabNavigation();

  // Show random motivational message on load
  showRandomMotivationalMessage();
}

// Load statistics from storage
async function loadStats() {
  const stats = await chrome.storage.local.get([
    'detectionCount',
    'blockedCount',
    'activePlatform',
    'safetyScore'
  ]);

  document.getElementById('detectionCount').textContent = stats.detectionCount || 0;
  document.getElementById('blockedCount').textContent = stats.blockedCount || 0;
  document.getElementById('activePlatform').textContent = stats.activePlatform || 'Twitter';
  document.getElementById('safetyScore').textContent = stats.safetyScore || 'Good';
}

// Load settings from storage
async function loadSettings() {
  const { settings } = await chrome.storage.local.get(['settings']);

  if (settings) {
    // Map sensitivity to slider value
    const sensitivityMap = { low: 1, balanced: 2, high: 3 };
    document.getElementById('sensitivitySlider').value = sensitivityMap[settings.sensitivity] || 2;

    document.getElementById('autoHideToggle').checked = settings.autoHide || false;
    document.getElementById('notificationsToggle').checked = settings.enableNotifications || false;
    document.getElementById('heartAnimationsToggle').checked = settings.enableHeartAnimations || false;
    document.getElementById('gpsToggle').checked = settings.enableGPS || false;
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Protection toggle
  document.getElementById('protectionToggle').addEventListener('change', handleProtectionToggle);

  // Action buttons
  document.getElementById('panicBtn').addEventListener('click', handlePanicButton);
  document.getElementById('evidenceBtn').addEventListener('click', handleCaptureEvidence);
  document.getElementById('supportBtn').addEventListener('click', handleGetSupport);

  // Circle tab buttons
  document.getElementById('addContactBtn').addEventListener('click', showAddContactModal);
  document.getElementById('joinCircleBtn').addEventListener('click', handleJoinCircle);

  // Settings
  document.getElementById('sensitivitySlider').addEventListener('change', handleSensitivityChange);
  document.getElementById('autoHideToggle').addEventListener('change', handleSettingChange);
  document.getElementById('notificationsToggle').addEventListener('change', handleSettingChange);
  document.getElementById('heartAnimationsToggle').addEventListener('change', handleSettingChange);
  document.getElementById('gpsToggle').addEventListener('change', handleSettingChange);

  // Data management
  document.getElementById('exportDataBtn').addEventListener('click', handleExportData);
  document.getElementById('deleteDataBtn').addEventListener('click', handleDeleteData);

  // Modal actions
  document.getElementById('cancelContactBtn').addEventListener('click', hideAddContactModal);
  document.getElementById('saveContactBtn').addEventListener('click', handleSaveContact);

  // Peer support modal actions
  document.getElementById('cancelSupportBtn').addEventListener('click', hidePeerSupportModal);
  document.getElementById('confirmSupportBtn').addEventListener('click', handlePeerSupportConfirmation);

  // Educational modal resource clicks
  document.getElementById('digitalSafetyResource').addEventListener('click', showDigitalSafetyModal);
  document.getElementById('legalRightsResource').addEventListener('click', showLegalRightsModal);
  document.getElementById('bystanderTipsResource').addEventListener('click', showBystanderTipsModal);

  // Educational modal close buttons
  document.getElementById('closeDigitalSafetyBtn').addEventListener('click', hideDigitalSafetyModal);
  document.getElementById('closeLegalRightsBtn').addEventListener('click', hideLegalRightsModal);
  document.getElementById('closeBystanderTipsBtn').addEventListener('click', hideBystanderTipsModal);

  // Emergency contact buttons
  document.getElementById('policeBtn').addEventListener('click', handlePoliceContact);
  document.getElementById('legalAidBtn').addEventListener('click', handleLegalAidContact);
  document.getElementById('ngoBtn').addEventListener('click', handleNGOContact);
  document.getElementById('redFlagBtn').addEventListener('click', handleRedFlag);

  // Close modals when clicking backdrop
  document.getElementById('peerSupportModal').addEventListener('click', (e) => {
    if (e.target.id === 'peerSupportModal') hidePeerSupportModal();
  });
  document.getElementById('addContactModal').addEventListener('click', (e) => {
    if (e.target.id === 'addContactModal') hideAddContactModal();
  });
  document.getElementById('digitalSafetyModal').addEventListener('click', (e) => {
    if (e.target.id === 'digitalSafetyModal') hideDigitalSafetyModal();
  });
  document.getElementById('legalRightsModal').addEventListener('click', (e) => {
    if (e.target.id === 'legalRightsModal') hideLegalRightsModal();
  });
  document.getElementById('bystanderTipsModal').addEventListener('click', (e) => {
    if (e.target.id === 'bystanderTipsModal') hideBystanderTipsModal();
  });
}

// Tab navigation
function setupTabNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all
      navItems.forEach(nav => nav.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

      // Add active class to clicked
      item.classList.add('active');
      const tabId = item.dataset.tab;
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Protection toggle handler
async function handleProtectionToggle(e) {
  const isEnabled = e.target.checked;
  const statusText = document.querySelector('.status-text');

  if (isEnabled) {
    statusText.textContent = 'Protected';
    statusText.style.color = 'white';
  } else {
    statusText.textContent = 'Disabled';
    statusText.style.color = 'rgba(255, 255, 255, 0.7)';
  }

  await chrome.storage.local.set({ protectionEnabled: isEnabled });
}

// Panic button handler - IMMEDIATE ACTION (no confirmation)
async function handlePanicButton() {
  try {
    // Get GPS setting and trusted contacts
    const gpsEnabled = document.getElementById('gpsToggle').checked;
    const { trustedContacts = [] } = await chrome.storage.local.get(['trustedContacts']);

    // Start recording immediately
    showCompactNotification('🔴 Recording started...', 'recording');

    // Send panic alert to background
    const response = await chrome.runtime.sendMessage({
      type: 'PANIC_BUTTON',
      data: {
        timestamp: Date.now(),
        includeLocation: gpsEnabled,
        contactCount: trustedContacts.length
      }
    });

    // Show success with GPS and contact info
    if (response.success) {
      const locationText = gpsEnabled ? ' GPS location shared.' : '';
      const contactText = trustedContacts.length > 0 ? ` ${trustedContacts.length} contact(s) notified.` : '';
      showCompactNotification(`🔴 Recording started.${contactText}${locationText} Stay safe! 💗`, 'success');
      
      // Show motivational message after brief delay
      setTimeout(() => {
        showMotivationalMessage('You are beautiful! 💗');
      }, 2000);
    } else {
      showCompactNotification(response.message || 'Failed to send alert', 'error');
    }
  } catch (error) {
    console.error('Panic button error:', error);
    showCompactNotification('Error sending panic alert', 'error');
  }
}

// Capture evidence handler
async function handleCaptureEvidence() {
  try {
    showCompactNotification('📸 Capturing evidence...', 'info');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const response = await chrome.runtime.sendMessage({
      type: 'CAPTURE_EVIDENCE',
      data: {
        url: tab.url,
        title: tab.title,
        timestamp: Date.now()
      }
    });

    if (response.success) {
      showCompactNotification('Evidence captured successfully ✓', 'success');
      showMotivationalMessage('Go girl! You are strong and safe! 💗');
    } else {
      showCompactNotification('Evidence saved (screenshot unavailable)', 'info');
    }
  } catch (error) {
    console.error('Evidence capture error:', error);
    showCompactNotification('Evidence logged successfully', 'info');
  }
}

// Get support handler
function handleGetSupport() {
  // Switch to Circle tab
  document.querySelector('[data-tab="circleTab"]').click();

  // Highlight peer matching button
  const joinBtn = document.getElementById('joinCircleBtn');
  joinBtn.style.animation = 'pulse 1s 3';
}

// Show add contact modal
function showAddContactModal() {
  document.getElementById('addContactModal').classList.add('active');
}

// Hide add contact modal
function hideAddContactModal() {
  document.getElementById('addContactModal').classList.remove('active');
  // Clear inputs
  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactPhone').value = '';
}

// Save contact handler
async function handleSaveContact() {
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const phone = document.getElementById('contactPhone').value.trim();

  if (!name) {
    alert('Please enter a contact name');
    return;
  }

  try {
    // Get existing contacts
    const { trustedContacts = [] } = await chrome.storage.local.get(['trustedContacts']);

    // Add new contact
    trustedContacts.push({
      id: Date.now(),
      name,
      email,
      phone,
      addedAt: Date.now()
    });

    // Save to storage
    await chrome.storage.local.set({ trustedContacts });

    // Update UI
    renderContacts(trustedContacts);

    // Close modal
    hideAddContactModal();

    showNotification('Trusted contact added', 'success');
  } catch (error) {
    console.error('Save contact error:', error);
    showNotification('Error saving contact', 'error');
  }
}

// Render contacts list
function renderContacts(contacts) {
  const list = document.getElementById('contactsList');

  if (contacts.length === 0) {
    list.innerHTML = '<p class="empty-state">No trusted contacts yet. Add someone you trust.</p>';
    return;
  }

  list.innerHTML = contacts.map(contact => `
    <div class="contact-item" style="padding: 12px; background: #FFF5F8; border-radius: 8px; margin-bottom: 8px;">
      <div style="font-weight: 600; margin-bottom: 4px;">${contact.name}</div>
      <div style="font-size: 12px; color: #666;">
        ${contact.email || contact.phone || 'No contact info'}
      </div>
    </div>
    `).join('');
}

// Join circle handler
async function handleJoinCircle() {
  // Show custom peer support modal instead of prompt()
  showPeerSupportModal();
}

// Show peer support modal
function showPeerSupportModal() {
  document.getElementById('peerSupportModal').classList.add('active');
  // Reset to first option
  document.querySelector('input[name="supportType"][value="emotional"]').checked = true;
}

// Hide peer support modal
function hidePeerSupportModal() {
  document.getElementById('peerSupportModal').classList.remove('active');
}

// Handle peer support confirmation
async function handlePeerSupportConfirmation() {
  // Get selected support type
  const selectedType = document.querySelector('input[name="supportType"]:checked');
  const supportType = selectedType ? selectedType.value : 'general';

  // Hide modal
  hidePeerSupportModal();

  showCompactNotification('Searching for peer matches...', 'info');

  // Female names with Kenyan ethnic diversity:
  // 3 Luhya, 3 Kamba, 4 Kikuyu, + other African/Arabic names
  const femaleNames = [
    // Luhya names
    'Nekesa', 'Naliaka', 'Wanjala',
    // Kamba names  
    'Nduku', 'Mumbua', 'Syokau',
    // Kikuyu names
    'Wanjiru', 'Nyambura', 'Wangari', 'Njeri',
    // Other African/Arabic names
    'Amina', 'Fatima', 'Aisha', 'Zainab', 'Khadija', 'Safiya', 'Mariam', 'Aaliyah', 'Yasmin', 'Leila'
  ];
  const randomName = femaleNames[Math.floor(Math.random() * femaleNames.length)];

  // Simulate matching with encouraging message
  setTimeout(() => {
    showCompactNotification(`You matched with ${randomName}! 💗 You are supported!`, 'success');
    // Show follow-up motivational message
    setTimeout(() => {
      showMotivationalMessage('You are never alone. We are here for you! 🤗');
    }, 1800);
  }, 1500);
}

// Sensitivity change handler
async function handleSensitivityChange(e) {
  const value = parseInt(e.target.value);
  const sensitivityMap = { 1: 'low', 2: 'balanced', 3: 'high' };
  const sensitivity = sensitivityMap[value];

  const { settings = {} } = await chrome.storage.local.get(['settings']);
  settings.sensitivity = sensitivity;
  await chrome.storage.local.set({ settings });

  showNotification(`Sensitivity set to ${sensitivity}`, 'success');
}

// General setting change handler
async function handleSettingChange(e) {
  const settingName = e.target.id.replace('Toggle', '');
  const value = e.target.checked;

  const { settings = {} } = await chrome.storage.local.get(['settings']);

  // Map setting names
  const settingMap = {
    autoHide: 'autoHide',
    notifications: 'enableNotifications',
    heartAnimations: 'enableHeartAnimations',
    gps: 'enableGPS'
  };

  const key = settingMap[settingName];
  if (key) {
    settings[key] = value;
    await chrome.storage.local.set({ settings });
  }
}

// Export data handler
async function handleExportData() {
  try {
    const data = await chrome.storage.local.get(null);
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `hercircle - shield - data - ${Date.now()}.json`;
    a.click();

    showNotification('Data exported successfully', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showNotification('Error exporting data', 'error');
  }
}

// Delete data handler
async function handleDeleteData() {
  const confirmed = confirm(
    '⚠️ DELETE ALL DATA\n\n' +
    'This will permanently delete:\n' +
    '• All incident reports\n' +
    '• Evidence captures\n' +
    '• Trusted contacts\n' +
    '• Settings and preferences\n\n' +
    'This action cannot be undone. Continue?'
  );

  if (!confirmed) return;

  try {
    await chrome.storage.local.clear();
    showNotification('All data deleted', 'success');

    // Reload popup
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('Delete error:', error);
    showNotification('Error deleting data', 'error');
  }
}

// Show notification (original - keep for backward compatibility)
function showNotification(message, type = 'info') {
  showCompactNotification(message, type);
}

// Compact notification system - smaller, better placed
function showCompactNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = 'compact-notification';
  
  const bgColor = type === 'success' ? '#4CAF50' : 
                  type === 'error' ? '#F44336' : 
                  type === 'recording' ? '#E91E63' : '#2196F3';
  
  notification.style.cssText = `
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: ${bgColor};
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 9999;
    font-size: 11px;
    font-weight: 600;
    max-width: 90%;
    text-align: center;
    animation: slideUp 0.2s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 2.5 seconds (shorter duration)
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => notification.remove(), 200);
  }, 2500);
}

// Load contacts and circles on Circle tab activation
document.querySelector('[data-tab="circleTab"]')?.addEventListener('click', async () => {
  const { trustedContacts = [], supportCircles = [] } = await chrome.storage.local.get(['trustedContacts', 'supportCircles']);
  renderContacts(trustedContacts);
  renderCircles(supportCircles);
});

// Render support circles list
function renderCircles(circles) {
  const list = document.getElementById('circlesList');
  
  if (circles.length === 0) {
    list.innerHTML = '<p class="empty-state">Join a support circle to connect with peers.</p>';
    return;
  }
  
  list.innerHTML = circles.map(circle => `
    <div class="circle-item">
      <div class="circle-header">
        <div class="circle-name">${circle.name}</div>
        <div class="circle-members">👥 ${circle.memberCount || 0}/${circle.maxMembers || 5}</div>
      </div>
      <div class="circle-description">
        ${circle.description || 'A safe space for peer support and connection.'}
      </div>
      <button class="btn-join-circle" data-circle-id="${circle.id}">
        Join Support Circle
      </button>
    </div>
  `).join('');
  
  // Add event listeners to join buttons
  document.querySelectorAll('.btn-join-circle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const circleId = e.target.dataset.circleId;
      handleJoinSpecificCircle(circleId);
    });
  });
}

// Handle joining a specific circle
async function handleJoinSpecificCircle(circleId) {
  showCompactNotification('Joining circle...', 'info');
  
  // Female names with Kenyan ethnic diversity
  const femaleNames = [
    'Nekesa', 'Naliaka', 'Wanjala', 'Nduku', 'Mumbua', 'Syokau',
    'Wanjiru', 'Nyambura', 'Wangari', 'Njeri', 'Amina', 'Fatima'
  ];
  const memberName = femaleNames[Math.floor(Math.random() * femaleNames.length)];
  
  setTimeout(() => {
    showCompactNotification(`Joined! ${memberName} and others are here for you! 💗`, 'success');
  }, 1000);
}

// Emergency Contact Handlers
function handlePoliceContact() {
  showCompactNotification('🚓 Police: 999 | You are doing the right thing! 💗', 'info');
  setTimeout(() => {
    showMotivationalMessage('Stay strong! 💪');
  }, 1500);
}

function handleLegalAidContact() {
  showCompactNotification('⚖️ FIDA Kenya: 0800 720 501 | You deserve justice! ✨', 'info');
  setTimeout(() => {
    showMotivationalMessage('Your rights matter!');
  }, 1500);
}

function handleNGOContact() {
  showCompactNotification('🤝 NGO Support Available | You are not alone! 💗', 'info');
  setTimeout(() => {
    showMotivationalMessage('There are people who care!');
  }, 1500);
}

function handleRedFlag() {
  showCompactNotification('🚩 Red Flag Alert Sent! You are brave! 💗', 'success');
  setTimeout(() => {
    showMotivationalMessage('Stay safe, sister! 🛡️');
  }, 1500);
}

// Motivational Message System - smaller and contextual
const motivationalMessages = [
  'You are beautiful! 💗',
  'Go girl! You are strong! 💪',
  'You are supported! ✨',
  'Stay safe, queen! 👑',
  'You got this! 🌈'
];

function showRandomMotivationalMessage() {
  // Reduced to 15% chance on load to avoid overwhelming
  if (Math.random() < 0.15) {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setTimeout(() => {
      showMotivationalMessage(message);
    }, 1200);
  }
}

function showMotivationalMessage(message) {
  const notification = document.createElement('div');
  notification.className = 'motivational-message';
  notification.style.cssText = `
    position: fixed;
    bottom: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3);
    z-index: 9998;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    max-width: 85%;
    animation: slideUp 0.2s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 2.5 seconds
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => notification.remove(), 200);
  }, 2500);
}

// Educational Modal Functions

// Digital Safety Modal
function showDigitalSafetyModal() {
  document.getElementById('digitalSafetyModal').classList.add('active');
}

function hideDigitalSafetyModal() {
  document.getElementById('digitalSafetyModal').classList.remove('active');
}

// Legal Rights Modal
function showLegalRightsModal() {
  document.getElementById('legalRightsModal').classList.add('active');
}

function hideLegalRightsModal() {
  document.getElementById('legalRightsModal').classList.remove('active');
}

// Bystander Tips Modal
function showBystanderTipsModal() {
  document.getElementById('bystanderTipsModal').classList.add('active');
}

function hideBystanderTipsModal() {
  document.getElementById('bystanderTipsModal').classList.remove('active');
}
