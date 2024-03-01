export const supportedLanguages = {
  locales: ["en", "es", "pt", "pt-BR"],
  fallbackLanguage: "en",
} as const;

export type Locale = (typeof supportedLanguages)["locales"][number];

const dictionaries = {
  en: () => import("../dictionaries/en.json").then((module) => module.default),
  pt: () => import("../dictionaries/pt.json").then((module) => module.default),
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
export const getDictionary = async (locale: Locale) => dictionaries[locale]();
