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

// Panic button handler
async function handlePanicButton() {
  const confirmed = confirm(
    '🚨 PANIC ALERT\n\n' +
    'This will:\n' +
    '• Alert your trusted contacts\n' +
    '• Capture current evidence\n' +
    '• Share your location (if enabled)\n\n' +
    'Continue?'
  );
  
  if (!confirmed) return;
  
  try {
    // Send message to background
    const response = await chrome.runtime.sendMessage({
      type: 'PANIC_BUTTON',
      data: {
        timestamp: Date.now(),
        includeLocation: document.getElementById('gpsToggle').checked
      }
    });
    
    if (response.success) {
      showNotification('Panic alert sent to your trusted contacts', 'success');
    } else {
      showNotification(response.message || 'Failed to send alert', 'error');
    }
  } catch (error) {
    console.error('Panic button error:', error);
    showNotification('Error sending panic alert', 'error');
  }
}

// Capture evidence handler
async function handleCaptureEvidence() {
  try {
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
      showNotification('Evidence captured successfully', 'success');
    } else {
      showNotification('Failed to capture evidence', 'error');
    }
  } catch (error) {
    console.error('Evidence capture error:', error);
    showNotification('Error capturing evidence', 'error');
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
  const supportType = prompt('What type of support are you looking for?\n\n' +
    'Examples:\n' +
    '- Emotional support\n' +
    '- Legal advice\n' +
    '- Safety planning\n' +
    '- General peer support');
  
  if (!supportType) return;
  
  showNotification('Searching for peer matches...', 'info');
  
  // In production, this would call the backend API
  setTimeout(() => {
    showNotification('No matches found right now. We\'ll notify you when someone joins.', 'info');
  }, 2000);
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
    a.download = `hercircle-shield-data-${Date.now()}.json`;
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

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-size: 13px;
    font-weight: 600;
    animation: slideDown 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Load contacts on Circle tab activation
document.querySelector('[data-tab="circleTab"]')?.addEventListener('click', async () => {
  const { trustedContacts = [] } = await chrome.storage.local.get(['trustedContacts']);
  renderContacts(trustedContacts);
});
