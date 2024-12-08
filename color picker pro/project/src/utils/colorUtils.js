import { rgbToHex } from './colorConversion.js';

export const extractColor = (element) => {
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

export const parseColor = (color) => {
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