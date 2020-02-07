/** @format */

const tagStyle = /<style((.|\n|\r)*?)<\/style>/gim;
const tagMeta = /<meta((.|\n|\r)*?)>/gim;

const excludeTags = [tagStyle, tagMeta];

const clearHtml = (html: string): string =>
  excludeTags.reduce((acc: string, cur: RegExp): string => acc.replace(cur, ''), html);

export default clearHtml;
