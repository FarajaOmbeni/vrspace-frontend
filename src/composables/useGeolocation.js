import { ref } from 'vue'

export function useGeolocation() {
  const position = ref(null)
  const error = ref(null)
  const loading = ref(false)

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      loading.value = true
      error.value = null

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          position.value = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          loading.value = false
          resolve(position.value)
        },
        (err) => {
          loading.value = false
          if (err.code === err.PERMISSION_DENIED) {
            error.value = 'Location access denied. Please enable location in your browser settings and try again.'
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            error.value = 'Unable to determine your location. Please try again.'
          } else if (err.code === err.TIMEOUT) {
            error.value = 'Location request timed out. Please try again.'
          } else {
            error.value = 'Failed to get your location.'
          }
          reject(new Error(error.value))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  // Haversine formula — distance in meters between two lat/lng points
  function distanceBetween(lat1, lng1, lat2, lng2) {
    const R = 6371000 // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180

    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function isWithinRadius(shopLat, shopLng, radiusMeters) {
    if (!position.value) return false
    const dist = distanceBetween(
      position.value.lat,
      position.value.lng,
      shopLat,
      shopLng
    )
    return { within: dist <= radiusMeters, distance: Math.round(dist) }
  }

  return {
    position,
    error,
    loading,
    getPosition,
    distanceBetween,
    isWithinRadius,
  }
}
