
import { useNotify } from '@/composables/useNotify'

export interface CurrentLocation {
  latitude: number
  longitude: number
}

export function getCurrentLocation(): Promise<CurrentLocation> {
  const notify = useNotify()

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const message = 'Your browser does not support location access.'
      notify.error(message)
      reject(new Error(message))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error: GeolocationPositionError) => {
        let message = 'Failed to get current location.'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission is required.'
            break

          case error.POSITION_UNAVAILABLE:
            message = 'Unable to get your current location.'
            break

          case error.TIMEOUT:
            message = 'Getting location timed out. Please try again.'
            break
        }

        notify.error(message)
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  })
}