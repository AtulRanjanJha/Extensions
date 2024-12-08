export const getElementFromPoint = (x, y) => {
  try {
    return document.elementFromPoint(x, y);
  } catch (error) {
    console.error('Error getting element from point:', error);
    return null;
  }
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};