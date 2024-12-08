import { hexToRgb } from '../utils/colorConversion.js';

export class ColorTooltip {
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

    // Keep tooltip within viewport
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