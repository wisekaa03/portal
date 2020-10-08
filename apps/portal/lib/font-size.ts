/** @format */

export const changeFontSize = (fontSize = 16): void => {
  if (!__SERVER__) {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }
};
