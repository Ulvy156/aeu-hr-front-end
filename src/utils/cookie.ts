const COOKIE_PATH = '/'
const SAME_SITE = 'Lax'

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match && match[1] !== undefined ? decodeURIComponent(match[1]) : null
}

export function setCookie(name: string, value: string, days = 7): void {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `expires=${expires.toUTCString()}`,
    `path=${COOKIE_PATH}`,
    `SameSite=${SAME_SITE}`,
  ].join('; ')
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_PATH}; SameSite=${SAME_SITE}`
}
