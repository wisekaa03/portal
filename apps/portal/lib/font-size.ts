/** @format */

export const changeFontSize = (fontSize: number): void => {
  if (!__SERVER__) {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }
};
