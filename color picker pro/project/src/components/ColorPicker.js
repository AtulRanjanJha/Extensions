import { extractColor, parseColor } from '../utils/colorUtils.js';
import { getElementFromPoint, copyToClipboard } from '../utils/domUtils.js';
import { ColorTooltip } from './Tooltip.js';

export class ColorPicker {
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