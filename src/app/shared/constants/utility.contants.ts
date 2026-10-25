/** 파스칼 케이스 */
export const toKebabCase = (str: string) =>
  str.replace(/([A-Z])/g, (_, c, i) => (i > 0 ? '-' : '') + c.toLowerCase());
