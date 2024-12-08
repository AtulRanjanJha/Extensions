// Color conversion utilities
const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// DOM utilities
const getElementFromPoint = (x, y) => {
  try {
    return document.elementFromPoint(x, y);
  } catch (error) {
    console.error('Error getting element from point:', error);
    return null;
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Color utilities
const extractColor = (element) => {
  try {
    const computedStyle = window.getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor;
    
    if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      const color = computedStyle.color;
      return color || null;
    }
    
    return bgColor;
  } catch (error) {
    console.error('Error extracting color:', error);
    return null;
  }
};

const parseColor = (color) => {
  try {
    if (!color) return null;

    // Handle hex colors directly
    if (color.startsWith('#')) {
      return color;
    }

    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    // Handle rgb/rgba colors
    const rgbMatch = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing color:', error);
    return null;
  }
};

// Tooltip class
class ColorTooltip {
  constructor() {
    this.tooltip = this.createTooltip();
    this.visible = false;
  }

  createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'color-picker-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    return tooltip;
  }

  show(x, y, color) {
    if (!color) return;

    this.tooltip.textContent = color;
    this.updatePosition(x, y);
    this.updateColors(color);
    this.tooltip.style.display = 'block';
    this.visible = true;
  }

  updatePosition(x, y) {
    const padding = 15;
    const rect = this.tooltip.getBoundingClientRect();
    
    let left = x + padding;
    let top = y + padding;

    if (left + rect.width > window.innerWidth) {
      left = x - rect.width - padding;
    }
    if (top + rect.height > window.innerHeight) {
      top = y - rect.height - padding;
    }

    this.tooltip.style.left = `${left}px`;
    this.tooltip.style.top = `${top}px`;
  }

  updateColors(hexColor) {
    this.tooltip.style.backgroundColor = hexColor;
    this.tooltip.style.color = this.getContrastColor(hexColor);
  }

  hide() {
    this.tooltip.style.display = 'none';
    this.visible = false;
  }

  showCopiedMessage() {
    const originalText = this.tooltip.textContent;
    this.tooltip.textContent = 'Copied!';
    setTimeout(() => {
      if (this.visible) {
        this.tooltip.textContent = originalText;
      }
    }, 1000);
  }

  getContrastColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#000000';

    const { r, g, b } = rgb;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }
}

// Color Picker class
class ColorPicker {
  constructor() {
    this.tooltip = new ColorTooltip();
    this.enabled = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupMessageListener();
  }

  setupEventListeners() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggle') {
        this.togglePicker(request.enabled);
        sendResponse({ success: true });
      } else if (request.action === 'getState') {
        sendResponse({ enabled: this.enabled });
      }
    });
  }

  togglePicker(enabled) {
    this.enabled = enabled;
    if (!this.enabled) {
      this.tooltip.hide();
    }
  }

  async handleMouseMove(event) {
    if (!this.enabled) return;

    const element = getElementFromPoint(event.clientX, event.clientY);
    if (!element) return;

    const color = extractColor(element);
    if (!color) return;

    const hexColor = parseColor(color);
    if (hexColor) {
      this.tooltip.show(event.clientX, event.clientY, hexColor);
    }
  }

  async handleClick(event) {
    if (!this.enabled || !this.tooltip.visible) return;

    const hexColor = this.tooltip.tooltip.textContent;
    const success = await copyToClipboard(hexColor);
    
    if (success) {
      this.tooltip.showCopiedMessage();
    }

    event.preventDefault();
    event.stopPropagation();
  }

  handleKeyDown(event) {
    if (event.key === 'Escape' && this.enabled) {
      this.togglePicker(false);
      chrome.runtime.sendMessage({ action: 'updateToggle', enabled: false });
    }
  }
}

// Initialize the color picker
const colorPicker = new ColorPicker();