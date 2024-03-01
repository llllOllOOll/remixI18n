import { pick } from "accept-language-parser";
import { getClientLocales } from "./get-client-locales";
import { Cookie, SessionStorage, json, redirect } from "@remix-run/node";
import { supportedLanguages } from "./dictionary";

export interface LanguageDetectorOption {
  supportedLanguages: string[];

  fallbackLanguage: string;

  cookie?: Cookie;
  /**
   * If you want to use a session to store the user preferred language, you can
   * pass the SessionStorage object here.
   * When this is not defined, getting the locale will ignore the session.
   */
  sessionStorage?: SessionStorage;
  /**
   * If defined a sessionStorage and want to change the default key used to
   * store the user preferred language, you can pass the key here.
   * @default "lng"
   */
  sessionKey?: string;
  /**
   * If you want to use search parameters for language detection and want to
   * change the default key used to for the parameter name,
   * you can pass the key here.
   * @default "lng"
   */
  searchParamKey?: string;

  order?: Array<"searchParams" | "cookie" | "session" | "header">;
}

export interface RemixI18Option {
  /**
   * The i18next options used to initialize the internal i18next instance.
   */
  // i18next?: Omit<InitOptions, "react" | "detection"> | null;
  /**
   * @deprecated Use `plugins` instead.
   * The i18next backend module used to load the translations when creating a
   * new TFunction.
   */
  // backend?: NewableModule<BackendModule<unknown>> | BackendModule<unknown>;
  /**
   * The i18next plugins used to extend the internal i18next instance
   * when creating a new TFunction.
   */
  // plugins?: NewableModule<Module>[] | Module[];
  detection: LanguageDetectorOption;
}

class LanguageDetector {
  constructor(private options: LanguageDetectorOption) {
    this.isSessionOnly(options);
    this.isCookieOnly(options);
  }

  private isSessionOnly(options: LanguageDetectorOption) {
    if (
      options.order?.length === 1 &&
      options.order[0] === "session" &&
      !options.sessionStorage
    ) {
      throw new Error(
        "You need a sessionStorage if you want to only get the locale from the session"
      );
    }
  }

  private isCookieOnly(options: LanguageDetectorOption) {
    if (
      options.order?.length === 1 &&
      options.order[0] === "cookie" &&
      !options.cookie
    ) {
      throw new Error(
        "You need a cookie if you want to only get the locale from the cookie"
      );
    }
  }

  public async detect(request: Request): Promise<string> {
    const order = this.options.order ?? [
      "searchParams",
      "cookie",
      "session",
      "header",
    ];

    for (const method of order) {
      let locale: string | null = null;

      if (method === "searchParams") {
        locale = await this.fromSearchParams(request);
      }

      if (method === "cookie") {
        locale = await this.fromCookie(request);
      }

      if (method === "session") {
        locale = await this.fromSessionStorage(request);
      }

      if (method === "header") {
        locale = await this.fromHeader(request);
      }

      if (locale) return locale;
    }

    return this.options.fallbackLanguage;
  }

  private async fromSearchParams(request: Request): Promise<string | null> {
    const url = new URL(request.url);
    if (!url.searchParams.has(this.options.searchParamKey ?? "lng")) {
      return null;
    }
    return this.fromSupported(
      url.searchParams.get(this.options.searchParamKey ?? "lng")
    );
  }

  private async fromCookie(request: Request): Promise<string | null> {
    if (!this.options.cookie) return null;

    const cookie = this.options.cookie;
    const lng = (await cookie.parse(request.headers.get("Cookie"))) ?? "";
    if (!lng) return null;

    return this.fromSupported(lng);
  }

  private async fromSessionStorage(request: Request): Promise<string | null> {
    if (!this.options.sessionStorage) return null;

    const session = await this.options.sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    const lng = session.get(this.options.sessionKey ?? "lng");

    if (!lng) return null;

    return this.fromSupported(lng);
  }

  private async fromHeader(request: Request): Promise<string | null> {
    const locales = getClientLocales(request);
    if (!locales) return null;
    if (Array.isArray(locales)) return this.fromSupported(locales.join(","));
    return this.fromSupported(locales);
  }

  private fromSupported(language: string | null) {
    return (
      pick(
        this.options.supportedLanguages,
        language ?? this.options.fallbackLanguage,
        { loose: false }
      ) ||
      pick(
        this.options.supportedLanguages,
        language ?? this.options.fallbackLanguage,
        { loose: true }
      )
    );
  }
}

export class RemixI18 {
  private detector: LanguageDetector;

  constructor(private options: RemixI18Option) {
    this.detector = new LanguageDetector(this.options.detection);
  }

  public async getLocale(request: Request): Promise<string> {
    return this.detector.detect(request);
  }
}

const checkPathName = async (request:Request) =>{
  const pathname = new URL(request.url).pathname
  const locale = await i18n.getLocale(request)

  const pathnameIsMissingLocale =  supportedLanguages.locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    return redirect(
    `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
    )
  }
  return json({locale})
}



const i18n = new RemixI18({
 detection: {
   supportedLanguages: ["en", "es", "pt", "pt-BR"],
   fallbackLanguage: "en",
 },
});

export { i18n, checkPathName }