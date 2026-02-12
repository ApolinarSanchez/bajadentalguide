type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

export function getSessionIdFromCookies(cookieStore: CookieStoreLike | null | undefined): string | null {
  if (!cookieStore) {
    return null;
  }

  const sessionValue = cookieStore.get("bdg_session")?.value?.trim();
  return sessionValue ? sessionValue : null;
}
