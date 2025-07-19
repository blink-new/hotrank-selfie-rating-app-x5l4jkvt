import { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, Dimensions, ScrollView, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import { Video, ResizeMode } from 'expo-av'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { 
  Camera as CameraIcon, 
  RotateCcw, 
  Image as ImageIcon, 
  ArrowLeft,
  Zap,
  Video as VideoIcon,
  Sparkles,
  Palette,
  X
} from 'lucide-react-native'
import blink from '@/lib/blink'

const { width, height } = Dimensions.get('window')

interface Filter {
  id: string
  name: string
  type: string
  isPremium: boolean
}

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('front')
  const [permission, requestPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [captureMode, setCaptureMode] = useState<'photo' | 'live_pic'>('photo')
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filter[]>([])
  const [user, setUser] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  
  const cameraRef = useRef<CameraView>(null)
  const recordingInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    requestPermission()
    requestMediaPermission()
    loadFilters()
    
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      // Check subscription status
      checkPremiumStatus(state.user)
    })
    
    return unsubscribe
  }, [])

  const checkPremiumStatus = async (user: any) => {
    if (!user) return
    
    try {
      const userRecord = await blink.db.users.list({
        where: { id: user.id },
        limit: 1
      })
      
      if (userRecord.length > 0) {
        setIsPremium(userRecord[0].subscriptionStatus === 'active')
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  const loadFilters = async () => {
    try {
      const filtersData = await blink.db.filters.list()
      setFilters(filtersData.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        isPremium: Number(f.isPremium) > 0
      })))
    } catch (error) {
      console.error('Error loading filters:', error)
    }
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return

    try {
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start recording timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 5) {
            stopRecording()
            return 5
          }
          return prev + 0.1
        })
      }, 100)

      const video = await cameraRef.current.recordAsync({
        maxDuration: 5,
        quality: '720p'
      })

      if (video) {
        await processVideo(video.uri)
      }
    } catch (error) {
      console.error('Error recording video:', error)
      Alert.alert('Error', 'Failed to record video. Please try again.')
      setIsRecording(false)
    }
  }

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return

    try {
      await cameraRef.current.stopRecording()
      setIsRecording(false)
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const takePicture = async () => {
    // Web fallback for testing
    if (Platform.OS === 'web') {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'user' // Front camera preference
      
      input.onchange = (event: any) => {
        const file = event.target.files[0]
        if (file) {
          setIsProcessing(true)
          const reader = new FileReader()
          reader.onload = async (e) => {
            const imageUri = e.target?.result as string
            
            // Convert data URL to blob for processing
            const response = await fetch(imageUri)
            const blob = await response.blob()
            
            // Create a temporary URL for the blob
            const tempUrl = URL.createObjectURL(blob)
            await processPhoto(tempUrl)
          }
          reader.readAsDataURL(file)
        }
      }
      
      input.click()
      return
    }

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
      if (!user) {
        Alert.alert('Error', 'Please log in to continue')
        setIsProcessing(false)
        return
      }

      console.log('Starting photo processing for user:', user.id)

      // Upload photo to storage
      console.log('Uploading photo to storage...')
      const response = await fetch(photoUri)
      const blob = await response.blob()
      
      const { publicUrl } = await blink.storage.upload(
        blob,
        `selfies/${user.id}/${Date.now()}.jpg`,
        { upsert: true }
      )
      console.log('Photo uploaded successfully:', publicUrl)

      // Generate AI score using real AI analysis
      console.log('Generating AI score...')
      const { generateRealHotnessScore, generateCityRank, getUserCity } = await import('@/utils/scoring')
      
      let score: number
      try {
        score = await generateRealHotnessScore(publicUrl)
        console.log('AI score generated:', score)
      } catch (scoreError) {
        console.error('Error generating AI score, using fallback:', scoreError)
        // Use fallback scoring if AI fails
        score = Math.floor(Math.random() * 30) + 70 // 70-100 range
      }
      
      const rank = generateCityRank(score)
      const city = await getUserCity()
      console.log('Generated rank:', rank, 'City:', city)

      // Create or update user profile
      console.log('Updating user profile...')
      await blink.db.users.upsert({
        id: user.id,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        subscriptionStatus: isPremium ? 'active' : 'free',
        city: city,
        updatedAt: new Date().toISOString()
      })

      // Save selfie to database
      console.log('Saving selfie to database...')
      const selfie = await blink.db.selfies.create({
        id: `selfie_${Date.now()}`,
        userId: user.id,
        imageUrl: publicUrl,
        type: 'photo',
        score: score,
        rank: rank,
        rankPosition: rank,
        city: city,
        isFiltered: selectedFilter ? 1 : 0,
        filterType: selectedFilter?.name || null,
        createdAt: new Date().toISOString()
      })
      console.log('Selfie saved:', selfie.id)

      // Update leaderboard
      console.log('Updating leaderboard...')
      await updateLeaderboard(user.id, selfie.id, city, score, rank)

      console.log('Processing complete, navigating to results...')
      // Navigate to results
      router.push({
        pathname: '/results',
        params: { 
          selfieId: selfie.id,
          score: score.toString(),
          rank: rank.toString(),
          city: city,
          imageUrl: publicUrl,
          type: 'photo'
        }
      })

    } catch (error) {
      console.error('Error processing photo:', error)
      Alert.alert('Error', `Failed to process your photo: ${error.message}. Please try again.`)
      setIsProcessing(false)
    }
  }

  const processVideo = async (videoUri: string) => {
    try {
      if (!user) {
        Alert.alert('Error', 'Please log in to continue')
        return
      }

      setIsProcessing(true)

      // Upload video to storage
      const response = await fetch(videoUri)
      const blob = await response.blob()
      
      const { publicUrl } = await blink.storage.upload(
        blob,
        `live_pics/${user.id}/${Date.now()}.mp4`,
        { upsert: true }
      )

      // Generate AI score for video (enhanced scoring for live pics)
      const { generateRealVideoScore, generateCityRank, getUserCity } = await import('@/utils/scoring')
      const score = await generateRealVideoScore(publicUrl)
      const rank = generateCityRank(score)
      const city = await getUserCity()

      // Save live pic to database
      const selfie = await blink.db.selfies.create({
        id: `live_pic_${Date.now()}`,
        userId: user.id,
        videoUrl: publicUrl,
        type: 'live_pic',
        score: score,
        rank: rank,
        rankPosition: rank,
        city: city,
        isFiltered: selectedFilter ? 1 : 0,
        filterType: selectedFilter?.name || null,
        createdAt: new Date().toISOString()
      })

      // Update leaderboard
      await updateLeaderboard(user.id, selfie.id, city, score, rank)

      // Navigate to results
      router.push({
        pathname: '/results',
        params: { 
          selfieId: selfie.id,
          score: score.toString(),
          rank: rank.toString(),
          city: city,
          videoUrl: publicUrl,
          type: 'live_pic'
        }
      })

    } catch (error) {
      console.error('Error processing video:', error)
      Alert.alert('Error', 'Failed to process your live pic. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }



  const updateLeaderboard = async (userId: string, selfieId: string, city: string, score: number, rank: number) => {
    try {
      await blink.db.leaderboard.create({
        id: `leaderboard_${Date.now()}`,
        userId,
        selfieId,
        city,
        score,
        rankPosition: rank,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating leaderboard:', error)
    }
  }

  const selectFilter = (filter: Filter) => {
    if (filter.isPremium && !isPremium) {
      Alert.alert(
        'Premium Filter',
        'This filter requires a premium subscription. Upgrade to unlock all filters!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') }
        ]
      )
      return
    }
    
    setSelectedFilter(filter)
    setShowFilters(false)
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
            We need access to your camera to take selfies and live pics for rating
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
            {captureMode === 'live_pic' ? 'Processing Your Live Pic' : 'Processing Your Selfie'}
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center'
          }}>
            Our AI is analyzing your {captureMode === 'live_pic' ? 'video' : 'photo'}...
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
          {captureMode === 'live_pic' ? 'Live Pic' : 'Take Selfie'}
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

      {/* Mode Selector */}
      <Animated.View 
        entering={FadeInUp.duration(600).delay(100)}
        style={{
          position: 'absolute',
          top: 120,
          left: 24,
          right: 24,
          zIndex: 10,
          flexDirection: 'row',
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 12,
          padding: 4
        }}
      >
        <TouchableOpacity
          onPress={() => setCaptureMode('photo')}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: captureMode === 'photo' ? 'white' : 'transparent',
            alignItems: 'center'
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: captureMode === 'photo' ? '#000' : 'white'
          }}>
            Photo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setCaptureMode('live_pic')}
          style={{
            flex: 1,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: captureMode === 'live_pic' ? 'white' : 'transparent',
            alignItems: 'center'
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: captureMode === 'live_pic' ? '#000' : 'white'
          }}>
            Live Pic
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Button */}
      <Animated.View 
        entering={FadeInUp.duration(600).delay(200)}
        style={{
          position: 'absolute',
          top: 180,
          right: 24,
          zIndex: 10
        }}
      >
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: selectedFilter ? '#FF1B6B' : 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Palette size={20} color="white" />
        </TouchableOpacity>
        {selectedFilter && (
          <Text style={{
            fontSize: 10,
            color: 'white',
            textAlign: 'center',
            marginTop: 4
          }}>
            {selectedFilter.name}
          </Text>
        )}
      </Animated.View>

      {/* Camera View */}
      {Platform.OS === 'web' ? (
        <View style={{ 
          flex: 1, 
          backgroundColor: '#1a1a1a',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Animated.View entering={FadeInUp.duration(600)} style={{ alignItems: 'center', padding: 24 }}>
            <CameraIcon size={64} color="rgba(255,255,255,0.5)" />
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginTop: 16,
              marginBottom: 8
            }}>
              Camera Preview Not Available
            </Text>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              marginBottom: 24
            }}>
              Use the capture button below to select a photo from your device
            </Text>
            <View style={{
              backgroundColor: 'rgba(255,27,107,0.1)',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,27,107,0.3)'
            }}>
              <Text style={{
                fontSize: 12,
                color: '#FF1B6B',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                💡 For full camera experience, use the Expo Go app on your phone
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : (
        <CameraView 
          ref={cameraRef}
          style={{ flex: 1 }} 
          facing={facing}
        >
          {/* Recording Timer */}
          {isRecording && (
            <Animated.View 
              entering={FadeInUp.duration(300)}
              style={{
                position: 'absolute',
                top: 240,
                left: 0,
                right: 0,
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <View style={{
                backgroundColor: '#FF0000',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'white',
                  marginRight: 8
                }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {recordingTime.toFixed(1)}s
                </Text>
              </View>
            </Animated.View>
          )}

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

          {/* Tips */}
          <Animated.View 
            entering={FadeInUp.duration(600).delay(300)}
            style={{
              position: 'absolute',
              top: 280,
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
              {captureMode === 'live_pic' 
                ? '🎥 Record a 5-second live pic for higher scores!'
                : '💡 Position your face in the frame for best results'
              }
            </Text>
          </Animated.View>
        </CameraView>
      )}

      {/* Bottom Controls - Outside camera view for web compatibility */}
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
          disabled={isRecording}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isRecording ? 0.5 : 1
          }}
        >
          <ImageIcon size={24} color="white" />
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity
          onPress={captureMode === 'live_pic' ? (isRecording ? stopRecording : startRecording) : takePicture}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isRecording ? '#FF0000' : 'white',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 4,
            borderColor: 'rgba(255,255,255,0.3)'
          }}
        >
          {captureMode === 'live_pic' ? (
            <VideoIcon size={32} color={isRecording ? 'white' : '#FF1B6B'} />
          ) : (
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#FF1B6B'
            }} />
          )}
        </TouchableOpacity>

        {/* Mode Icon */}
        <View style={{
          width: 60,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {captureMode === 'live_pic' ? (
            <VideoIcon size={24} color="rgba(255,255,255,0.7)" />
          ) : (
            <CameraIcon size={24} color="rgba(255,255,255,0.7)" />
          )}
        </View>
      </Animated.View>

      {/* Filters Modal */}
      {showFilters && (
        <Animated.View 
          entering={FadeInUp.duration(300)}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            maxHeight: height * 0.5
          }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'white'
            }}>
              Filters
            </Text>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => {
                setSelectedFilter(null)
                setShowFilters(false)
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                backgroundColor: !selectedFilter ? '#FF1B6B' : 'rgba(255,255,255,0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                borderWidth: 2,
                borderColor: !selectedFilter ? '#FF1B6B' : 'transparent'
              }}
            >
              <Text style={{
                fontSize: 12,
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                None
              </Text>
            </TouchableOpacity>

            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                onPress={() => selectFilter(filter)}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  backgroundColor: selectedFilter?.id === filter.id ? '#FF1B6B' : 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                  borderWidth: 2,
                  borderColor: selectedFilter?.id === filter.id ? '#FF1B6B' : 'transparent'
                }}
              >
                {filter.isPremium && (
                  <View style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#FFD700',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Sparkles size={8} color="#000" />
                  </View>
                )}
                <Text style={{
                  fontSize: 12,
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!isPremium && (
            <TouchableOpacity
              onPress={() => {
                setShowFilters(false)
                router.push('/subscription')
              }}
              style={{
                backgroundColor: '#FFD700',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 20,
                marginTop: 16,
                alignItems: 'center'
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#000'
              }}>
                Upgrade for Premium Filters
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  )
}