import { getCookie, setCookie } from '@/utils/cookie'

const DEVICE_ID_KEY = 'device_id'
/** Keep the browser identity across logout so re-login replaces the same session. */
const DEVICE_ID_DAYS = 365

/**
 * Stable per-browser label for Sanctum token naming.
 * Not a secret — auth is still the access token + credentials.
 */
export function getDeviceName(): string {
  let id = getCookie(DEVICE_ID_KEY)

  if (!id) {
    id = crypto.randomUUID()
    setCookie(DEVICE_ID_KEY, id, DEVICE_ID_DAYS)
  }

  return `web-${id}`
}
