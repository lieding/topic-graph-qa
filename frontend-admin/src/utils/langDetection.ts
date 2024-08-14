// https://github.com/wooorm/franc/tree/main/packages/franc-min
export const LangMap: Record<string, { name: string, iso: string }> = {
  cmn: {
    name: 'Mandarin Chinese',
    iso: 'zh'
  },
  eng: {
    name: 'English',
    iso: 'en'
  },
  fra: {
    name: 'French',
    iso: 'fr'
  },
  jpn: {
    name: 'Japanese',
    iso: 'jp'
  }
};


export function detectLang(text: string) {
  // @ts-ignore
  const fun = window.detectLang as ((text: string) => [string, number][]);
  if (!fun) return null;
  const ret = [];
  const options = fun(text);
  for (const it of options) {
    const config = LangMap[it[0] ?? ''];
    if (config)
      ret.push(config);
  }
  return ret;
}