document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('togglePicker');

  // Get current state
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {action: 'getState'}, (response) => {
      if (response) {
        toggle.checked = response.enabled;
      }
    });
  });

  // Handle toggle changes
  toggle.addEventListener('change', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'toggle',
        enabled: toggle.checked
      });
    });
  });

  // Listen for updates from content script
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'updateToggle') {
      toggle.checked = request.enabled;
    }
  });
});