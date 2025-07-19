import { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as ImagePicker from 'expo-image-picker'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { 
  Camera as CameraIcon, 
  RotateCcw, 
  Image as ImageIcon, 
  ArrowLeft,
  Zap
} from 'lucide-react-native'
import blink from '@/lib/blink'

const { width, height } = Dimensions.get('window')

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('front')
  const [permission, requestPermission] = useCameraPermissions()
  const [isProcessing, setIsProcessing] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    requestPermission()
  }, [])

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      setIsProcessing(true)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false
      })

      if (photo) {
        await processPhoto(photo.uri)
      }
    } catch (error) {
      console.error('Error taking picture:', error)
      Alert.alert('Error', 'Failed to take picture. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true)
        await processPhoto(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to select image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const processPhoto = async (photoUri: string) => {
    try {
      // Get current user
      const user = await blink.auth.me()
      if (!user) {
        Alert.alert('Error', 'Please log in to continue')
        return
      }

      // Upload photo to storage
      const response = await fetch(photoUri)
      const blob = await response.blob()
      
      const { publicUrl } = await blink.storage.upload(
        blob,
        `selfies/${user.id}/${Date.now()}.jpg`,
        { upsert: true }
      )

      // Generate AI score using utility
      const { generateHotnessScore, generateCityRank } = await import('@/utils/scoring')
      const score = generateHotnessScore()
      const rank = generateCityRank(score)
      const city = 'Your City' // TODO: Get from location service

      // Create or update user profile
      await blink.db.users.upsert({
        id: user.id,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        subscriptionStatus: 'free',
        updatedAt: new Date().toISOString()
      })

      // Save selfie to database
      const selfie = await blink.db.selfies.create({
        userId: user.id,
        imageUrl: publicUrl,
        score: score,
        rank: rank,
        city: city,
        createdAt: new Date().toISOString()
      })

      // Navigate to results
      router.push({
        pathname: '/results',
        params: { 
          selfieId: selfie.id,
          score: score.toString(),
          rank: rank.toString(),
          city: city,
          imageUrl: publicUrl
        }
      })

    } catch (error) {
      console.error('Error processing photo:', error)
      Alert.alert('Error', 'Failed to process your photo. Please try again.')
    }
  }

  if (!permission) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16, color: 'white' }}>Requesting camera permission...</Text>
      </LinearGradient>
    )
  }

  if (!permission.granted) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      >
        <Animated.View entering={FadeInUp.duration(600)} style={{ alignItems: 'center' }}>
          <CameraIcon size={64} color="white" />
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginTop: 24,
            marginBottom: 16
          }}>
            Camera Access Required
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            marginBottom: 32
          }}>
            We need access to your camera to take selfies for rating
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 32
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#FF1B6B'
            }}>
              Grant Permission
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    )
  }

  if (isProcessing) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Animated.View entering={FadeInUp.duration(600)} style={{ alignItems: 'center' }}>
          <Zap size={64} color="white" />
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginTop: 24,
            marginBottom: 16
          }}>
            Processing Your Selfie
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center'
          }}>
            Our AI is analyzing your photo...
          </Text>
        </Animated.View>
      </LinearGradient>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {/* Header */}
      <Animated.View 
        entering={FadeInUp.duration(600)}
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          zIndex: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>

        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: 'white'
        }}>
          Take Selfie
        </Text>

        <TouchableOpacity
          onPress={toggleCameraFacing}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <RotateCcw size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Camera View */}
      <CameraView 
        ref={cameraRef}
        style={{ flex: 1 }} 
        facing={facing}
      >
        {/* Camera Overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Face Guide */}
          <View style={{
            width: width * 0.7,
            height: width * 0.9,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.5)',
            borderStyle: 'dashed'
          }} />
        </View>

        {/* Bottom Controls */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 24
          }}
        >
          {/* Gallery Button */}
          <TouchableOpacity
            onPress={pickImage}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <ImageIcon size={24} color="white" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            onPress={takePicture}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 4,
              borderColor: 'rgba(255,255,255,0.3)'
            }}
          >
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#FF1B6B'
            }} />
          </TouchableOpacity>

          {/* Placeholder for symmetry */}
          <View style={{ width: 60, height: 60 }} />
        </Animated.View>

        {/* Tips */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(300)}
          style={{
            position: 'absolute',
            top: 140,
            left: 24,
            right: 24,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 12,
            padding: 16
          }}
        >
          <Text style={{
            fontSize: 14,
            color: 'white',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            💡 Position your face in the frame for best results
          </Text>
        </Animated.View>
      </CameraView>
    </View>
  )
}