/** @format */

const tagStyle = /<style((.|\n|\r)*?)<\/style>/gim;
const tagMeta = /<meta((.|\n|\r)*?)>/gim;

const excludeTags = [tagStyle, tagMeta];

const clearHtml = (html: string, len?: number): string => {
  const result = excludeTags.reduce((acc: string, cur: RegExp): string => acc.replace(cur, ''), html);

  return len ? result.substring(0, len) : result;
};

export default clearHtml;
