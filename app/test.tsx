import { View, Text } from 'react-native'

export default function Test() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF1B6B' }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
        HotRank Test Page
      </Text>
      <Text style={{ color: 'white', fontSize: 16, marginTop: 8 }}>
        If you can see this, the app is working!
      </Text>
    </View>
  )
}