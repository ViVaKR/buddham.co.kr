export interface IFontOption {
  value: string;
  label: string;
  className: string;
  preview: string;
  korean?: string;
  hanja?: string;
  english?: string;
  sanskrit?: string;
}

export const createFont = (
  value: string,
  label: string,
  preview: string = '나무 아미타불',
  korean: string = '나무 아미타불',
  hanja: string = '南無阿彌陀佛',
  english: string = 'Namo Amitabha Buddha',
  sanskrit: string = 'नमॊ ऽमिताभाय (Namo Amitābhāya)'
): IFontOption => ({
  value: `font-${value}`,
  label,
  className: `font-${value}`,
  preview,
  korean,
  hanja,
  english,
  sanskrit
});
