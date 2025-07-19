import * as Location from 'expo-location'

export async function getCurrentCity(): Promise<string> {
  try {
    // Request permission to access location
    const { status } = await Location.requestForegroundPermissionsAsync()
    
    if (status !== 'granted') {
      return 'Unknown City'
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({})
    
    // Reverse geocode to get city name
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })

    if (reverseGeocode.length > 0) {
      const { city, region } = reverseGeocode[0]
      return city || region || 'Unknown City'
    }

    return 'Unknown City'
  } catch (error) {
    console.error('Error getting location:', error)
    return 'Unknown City'
  }
}

// Mock cities for demo purposes
const mockCities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
  'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston'
]

export function getMockCity(): string {
  return mockCities[Math.floor(Math.random() * mockCities.length)]
}