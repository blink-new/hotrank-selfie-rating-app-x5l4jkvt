import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Camera, Sparkles, TrendingUp } from 'lucide-react-native'
import blink from '@/lib/blink'

const { width, height } = Dimensions.get('window')

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // If user is authenticated, go to dashboard
      if (state.user && !state.isLoading) {
        router.replace('/dashboard')
      }
    })
    
    return unsubscribe
  }, [])

  const handleGetStarted = () => {
    router.push('/onboarding')
  }

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 16
          }}>
            HotPink
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center'
          }}>
            Loading...
          </Text>
        </Animated.View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#FF1B6B', '#45CAFF']}
      style={{ flex: 1 }}
    >
      <View style={{ 
        flex: 1, 
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40
      }}>
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.duration(800)}
          style={{ alignItems: 'center', marginBottom: 60 }}
        >
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <Sparkles size={40} color="white" />
          </View>
          
          <Text style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 8
          }}>
            HotPink
          </Text>
          
          <Text style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center'
          }}>
            Did you get Pinked today?
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(200)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <View style={{ marginBottom: 40 }}>
            <FeatureItem 
              icon={<Camera size={24} color="white" />}
              title="Take a Selfie"
              description="Upload your best photo and let AI analyze it"
            />
            <FeatureItem 
              icon={<Sparkles size={24} color="white" />}
              title="Get Your Score"
              description="Receive a hotness rating from 60-100"
            />
            <FeatureItem 
              icon={<TrendingUp size={24} color="white" />}
              title="City Rankings"
              description="See how you rank against others in your city"
            />
          </View>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View 
          entering={FadeInDown.duration(800).delay(400)}
        >
          <TouchableOpacity
            onPress={handleGetStarted}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              paddingVertical: 18,
              paddingHorizontal: 32,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FF1B6B'
            }}>
              Get Started
            </Text>
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            marginTop: 16
          }}>
            Free to start • Premium features available
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  )
}

function FeatureItem({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 16
    }}>
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
      }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: 'white',
          marginBottom: 4
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 20
        }}>
          {description}
        </Text>
      </View>
    </View>
  )
}