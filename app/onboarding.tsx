import { useState } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { ArrowRight, Shield, Zap, Heart } from 'lucide-react-native'
import blink from '@/lib/blink'

const { width } = Dimensions.get('window')

const onboardingSteps = [
  {
    icon: <Heart size={60} color="white" />,
    title: "Welcome to HotPink",
    description: "The AI-powered app that rates your selfies and shows you how you rank in your city",
    buttonText: "Continue"
  },
  {
    icon: <Zap size={60} color="white" />,
    title: "How It Works",
    description: "Take a selfie, get an AI-generated hotness score from 60-100, and see your city ranking",
    buttonText: "Got It"
  },
  {
    icon: <Shield size={60} color="white" />,
    title: "Privacy First",
    description: "Your photos are processed securely and you control what gets shared. Ready to get Pinked?",
    buttonText: "Let's Go!"
  }
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSignIn()
    }
  }

  const handleSignIn = () => {
    blink.auth.login('/dashboard')
  }

  const currentStepData = onboardingSteps[currentStep]

  return (
    <LinearGradient
      colors={['#FF1B6B', '#45CAFF']}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        {/* Progress Indicator */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 60
          }}
        >
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index <= currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                marginHorizontal: 4
              }}
            />
          ))}
        </Animated.View>

        {/* Content */}
        <Animated.View 
          key={currentStep}
          entering={FadeInDown.duration(600)}
          style={{ alignItems: 'center', marginBottom: 80 }}
        >
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 40
          }}>
            {currentStepData.icon}
          </View>

          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 20
          }}>
            {currentStepData.title}
          </Text>

          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            lineHeight: 24,
            paddingHorizontal: 20
          }}>
            {currentStepData.description}
          </Text>
        </Animated.View>

        {/* Action Button */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
        >
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              paddingVertical: 18,
              paddingHorizontal: 32,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
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
              color: '#FF1B6B',
              marginRight: 8
            }}>
              {currentStepData.buttonText}
            </Text>
            <ArrowRight size={20} color="#FF1B6B" />
          </TouchableOpacity>

          {currentStep === onboardingSteps.length - 1 && (
            <Text style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              marginTop: 16,
              paddingHorizontal: 20
            }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          )}
        </Animated.View>
      </View>
    </LinearGradient>
  )
}