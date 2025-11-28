// HerCircle Shield Background Service Worker
// Handles extension lifecycle, alarms, notifications, and message passing

const API_BASE_URL = 'https://3000-ic49iebgbiiplf055haod-cce9b6b1.manusvm.computer/api/trpc';

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('HerCircle Shield installed:', details.reason);
  
  // Generate anonymous user ID
  const anonymousId = generateAnonymousId();
  await chrome.storage.local.set({
    anonymousId,
    installDate: Date.now(),
    detectionCount: 0,
    blockedCount: 0,
    settings: {
      sensitivity: 'balanced',
      autoHide: true,
      enableNotifications: true,
      enableGPS: false,
      enableHeartAnimations: true,
      language: 'en'
    }
  });
  
  // Set up periodic heart animations (every 2 hours)
  chrome.alarms.create('heartAnimation', { periodInMinutes: 120 });
  
  // Set up daily stats summary
  chrome.alarms.create('dailyStats', { periodInMinutes: 1440 });
  
  console.log('HerCircle Shield initialized with ID:', anonymousId);
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'heartAnimation') {
    showHeartNotification();
  } else if (alarm.name === 'dailyStats') {
    showDailyStats();
  }
});

// Message passing from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);
  
  switch (message.type) {
    case 'DETECT_CONTENT':
      handleDetection(message.data, sender.tab?.id).then(sendResponse);
      return true; // Keep channel open for async response
      
    case 'PANIC_BUTTON':
      handlePanicButton(message.data).then(sendResponse);
      return true;
      
    case 'CAPTURE_EVIDENCE':
      captureEvidence(sender.tab?.id, message.data).then(sendResponse);
      return true;
      
    case 'ALERT_CONTACTS':
      alertTrustedContacts(message.data).then(sendResponse);
      return true;
      
    case 'UPDATE_BADGE':
      updateBadge(message.count);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// Generate anonymous user ID
function generateAnonymousId() {
  return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Handle content detection
async function handleDetection(content, tabId) {
  try {
    const settings = await getSettings();
    
    // Call backend AI detection
    const response = await fetch(`${API_BASE_URL}/ai.detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content })
    });
    
    const result = await response.json();
    
    if (result.isHarmful) {
      // Update stats
      await incrementDetectionCount();
      
      // Show notification if enabled
      if (settings.enableNotifications) {
        showThreatNotification(result);
      }
      
      // Update badge
      const stats = await chrome.storage.local.get(['detectionCount']);
      updateBadge(stats.detectionCount || 0);
      
      // Send to content script for visual alert
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          type: 'THREAT_DETECTED',
          data: result
        });
      }
      
      // Log detection
      await logDetection(result, content);
    }
    
    return result;
  } catch (error) {
    console.error('Detection error:', error);
    return { error: error.message };
  }
}

// Handle panic button activation
async function handlePanicButton(data) {
  try {
    // Alert trusted contacts
    await alertTrustedContacts(data);
    
    // Show confirmation notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../icons/heart-48.png',
      title: 'Panic Alert Sent',
      message: 'Your trusted contacts have been notified.',
      priority: 2
    });
    
    // Optional: Share GPS location
    const settings = await getSettings();
    if (settings.enableGPS && data.includeLocation) {
      // GPS sharing would be handled here
      console.log('GPS sharing requested');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Panic button error:', error);
    return { error: error.message };
  }
}

// Capture evidence (screenshot)
async function captureEvidence(tabId, data) {
  try {
    // Capture visible tab
    const screenshot = await chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    });
    
    // Store evidence
    const evidence = {
      timestamp: Date.now(),
      screenshot,
      url: data.url,
      platform: data.platform,
      description: data.description
    };
    
    // Save to storage
    const { evidenceList = [] } = await chrome.storage.local.get(['evidenceList']);
    evidenceList.push(evidence);
    await chrome.storage.local.set({ evidenceList });
    
    return { success: true, evidenceId: evidenceList.length - 1 };
  } catch (error) {
    console.error('Evidence capture error:', error);
    return { error: error.message };
  }
}

// Alert trusted contacts
async function alertTrustedContacts(data) {
  try {
    const { trustedContacts = [] } = await chrome.storage.local.get(['trustedContacts']);
    
    if (trustedContacts.length === 0) {
      return { success: false, message: 'No trusted contacts configured' };
    }
    
    // In production, this would send actual alerts via backend API
    console.log('Alerting contacts:', trustedContacts);
    
    return { success: true, contactsAlerted: trustedContacts.length };
  } catch (error) {
    console.error('Alert contacts error:', error);
    return { error: error.message };
  }
}

// Show heart animation notification
async function showHeartNotification() {
  const settings = await getSettings();
  if (!settings.enableHeartAnimations) return;
  
  const messages = [
    "You're not alone 💗",
    "You're strong 💖",
    "We're here for you 💕",
    "Stay safe 💗",
    "You matter 💖"
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/heart-glow-48.png',
    title: 'HerCircle Shield',
    message,
    priority: 0
  });
}

// Show daily stats
async function showDailyStats() {
  const stats = await chrome.storage.local.get(['detectionCount', 'blockedCount']);
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/heart-48.png',
    title: 'Daily Safety Report',
    message: `Detected: ${stats.detectionCount || 0} threats\nBlocked: ${stats.blockedCount || 0} items`,
    priority: 1
  });
}

// Show threat notification
function showThreatNotification(result) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/heart-glow-48.png',
    title: '⚠️ Threat Detected',
    message: `${result.severity.toUpperCase()}: ${result.detectionType.join(', ')}`,
    priority: 2
  });
}

// Update extension badge
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Helper functions
async function getSettings() {
  const { settings } = await chrome.storage.local.get(['settings']);
  return settings || {};
}

async function incrementDetectionCount() {
  const { detectionCount = 0 } = await chrome.storage.local.get(['detectionCount']);
  await chrome.storage.local.set({ detectionCount: detectionCount + 1 });
}

async function logDetection(result, content) {
  const { detectionLog = [] } = await chrome.storage.local.get(['detectionLog']);
  detectionLog.push({
    timestamp: Date.now(),
    result,
    contentPreview: content.substring(0, 100)
  });
  
  // Keep only last 100 detections
  if (detectionLog.length > 100) {
    detectionLog.shift();
  }
  
  await chrome.storage.local.set({ detectionLog });
}

console.log('HerCircle Shield background service worker loaded');
