import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, Dimensions, Share, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from 'react-native-reanimated'
import { 
  Trophy, 
  Share2, 
  Camera, 
  Crown, 
  ArrowLeft,
  Star,
  TrendingUp,
  Users,
  Instagram,
  Download,
  Video as VideoIcon
} from 'lucide-react-native'
import blink from '@/lib/blink'

const { width } = Dimensions.get('window')

export default function Results() {
  const params = useLocalSearchParams()
  const [user, setUser] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [showBlur, setShowBlur] = useState(true)
  const [isSharing, setIsSharing] = useState(false)

  const score = parseInt(params.score as string) || 0
  const rank = parseInt(params.rank as string) || 0
  const imageUrl = params.imageUrl as string
  const videoUrl = params.videoUrl as string
  const type = params.type as string || 'photo'
  const city = params.city as string || 'Your City'

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
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
        const isActive = userRecord[0].subscriptionStatus === 'active'
        setIsPremium(isActive)
        setShowBlur(!isActive)
      }
    } catch (error) {
      console.error('Error checking premium status:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00FF88'
    if (score >= 80) return '#FFD700'
    if (score >= 70) return '#FF8C00'
    return '#FF1B6B'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 95) return "🔥 Absolutely stunning!"
    if (score >= 90) return "✨ You're gorgeous!"
    if (score >= 85) return "😍 Looking amazing!"
    if (score >= 80) return "🌟 Very attractive!"
    if (score >= 75) return "😊 Looking good!"
    if (score >= 70) return "👍 Nice photo!"
    return "📸 Keep practicing!"
  }

  const getRankMessage = (rank: number) => {
    if (rank <= 100) return "Top 1% in your city! 🏆"
    if (rank <= 500) return "Top 5% in your city! 🥇"
    if (rank <= 1000) return "Top 10% in your city! 🥈"
    if (rank <= 2500) return "Top 25% in your city! 🥉"
    return "Keep improving! 💪"
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      
      const message = `I just got Pinked with a score of ${isPremium ? score : '••'}/100 on HotPink! 🔥 ${type === 'live_pic' ? 'Live Pic' : 'Selfie'} rating by AI. Check out this app!`
      
      await Share.share({
        message,
        url: 'https://hotpink.app' // Replace with actual app URL
      })
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleInstagramShare = async () => {
    try {
      setIsSharing(true)
      
      // Create a shareable image with score overlay
      const shareableContent = await createShareableContent()
      
      if (shareableContent) {
        await Sharing.shareAsync(shareableContent, {
          mimeType: type === 'live_pic' ? 'video/mp4' : 'image/jpeg',
          dialogTitle: 'Share to Instagram'
        })
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error)
      Alert.alert('Error', 'Failed to share to Instagram. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const createShareableContent = async (): Promise<string | null> => {
    try {
      // For now, just return the original content
      // In a real app, you'd overlay the score and branding
      const sourceUrl = type === 'live_pic' ? videoUrl : imageUrl
      
      if (!sourceUrl) return null
      
      // Download the file to local storage
      const fileExtension = type === 'live_pic' ? 'mp4' : 'jpg'
      const fileName = `hotpink_${Date.now()}.${fileExtension}`
      const localUri = `${FileSystem.documentDirectory}${fileName}`
      
      const downloadResult = await FileSystem.downloadAsync(sourceUrl, localUri)
      
      if (downloadResult.status === 200) {
        return downloadResult.uri
      }
      
      return null
    } catch (error) {
      console.error('Error creating shareable content:', error)
      return null
    }
  }

  const handleUpgrade = () => {
    router.push('/subscription')
  }

  const handleTakeAnother = () => {
    router.push('/camera')
  }

  const handleViewLeaderboard = () => {
    router.push('/leaderboard')
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleDownload = async () => {
    try {
      const shareableContent = await createShareableContent()
      if (shareableContent) {
        Alert.alert('Success', `${type === 'live_pic' ? 'Video' : 'Photo'} saved to your device!`)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download. Please try again.')
    }
  }

  return (
    <LinearGradient
      colors={['#FF1B6B', '#45CAFF']}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32
          }}
        >
          <TouchableOpacity
            onPress={handleBackToDashboard}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white'
            }}>
              Your Results
            </Text>
            {type === 'live_pic' && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4
              }}>
                <VideoIcon size={12} color="rgba(255,255,255,0.8)" />
                <Text style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.8)',
                  marginLeft: 4
                }}>
                  Live Pic
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={handleShare}
            disabled={isSharing}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isSharing ? 0.5 : 1
            }}
          >
            <Share2 size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Media Display */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100)}
          style={{
            alignItems: 'center',
            marginBottom: 32
          }}
        >
          <View style={{
            width: width * 0.6,
            height: width * 0.75,
            borderRadius: 20,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 16
          }}>
            {type === 'live_pic' && videoUrl ? (
              <Video
                source={{ uri: videoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
              />
            ) : (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            )}
          </View>
          
          {/* Live Pic Badge */}
          {type === 'live_pic' && (
            <Animated.View 
              entering={FadeInUp.duration(400).delay(300)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#FF0000',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <VideoIcon size={12} color="white" />
              <Text style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: 'white',
                marginLeft: 4
              }}>
                LIVE
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Score Card */}
        <Animated.View 
          entering={FadeInLeft.duration(600).delay(200)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            alignItems: 'center'
          }}
        >
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 8
          }}>
            Your Hotness Score
          </Text>
          
          <View style={{ position: 'relative', alignItems: 'center' }}>
            <Text style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: getScoreColor(score),
              filter: showBlur && !isPremium ? 'blur(8px)' : 'none'
            }}>
              {isPremium ? score : '••'}
            </Text>
            
            {showBlur && !isPremium && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 12
              }}>
                <Crown size={32} color="#FFD700" />
              </View>
            )}
          </View>

          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginTop: 8
          }}>
            {isPremium ? getScoreMessage(score) : 'Unlock to see your score!'}
          </Text>
          
          {type === 'live_pic' && isPremium && (
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              marginTop: 8
            }}>
              🎥 Live Pic Bonus Applied!
            </Text>
          )}
        </Animated.View>

        {/* Ranking Card */}
        <Animated.View 
          entering={FadeInLeft.duration(600).delay(300)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 24
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Trophy size={24} color="#FFD700" />
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: 'white',
                marginLeft: 8
              }}>
                {city} Ranking
              </Text>
            </View>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#FFD700',
              filter: showBlur && !isPremium ? 'blur(4px)' : 'none'
            }}>
              {isPremium ? `#${rank}` : '#••••'}
            </Text>
          </View>
          
          <Text style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center'
          }}>
            {isPremium ? getRankMessage(rank) : 'Upgrade to see your exact ranking'}
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(400)}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          {!isPremium && (
            <TouchableOpacity
              onPress={handleUpgrade}
              style={{
                backgroundColor: '#FFD700',
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 24,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8
              }}
            >
              <Crown size={24} color="#000" />
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#000',
                marginLeft: 8
              }}>
                Unlock Premium - $3.99/week
              </Text>
            </TouchableOpacity>
          )}

          {/* Social Share Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 16
          }}>
            <TouchableOpacity
              onPress={handleInstagramShare}
              disabled={isSharing}
              style={{
                flex: 1,
                backgroundColor: '#E4405F',
                borderRadius: 16,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                opacity: isSharing ? 0.5 : 1
              }}
            >
              <Instagram size={20} color="white" />
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
                marginLeft: 8
              }}>
                Instagram
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownload}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 16,
                paddingVertical: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              <Download size={20} color="white" />
              <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: 'white',
                marginLeft: 8
              }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <TouchableOpacity
              onPress={handleTakeAnother}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              <Camera size={20} color="white" />
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: 'white',
                marginLeft: 8
              }}>
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewLeaderboard}
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center'
              }}
            >
              <Users size={20} color="#FF1B6B" />
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#FF1B6B',
                marginLeft: 8
              }}>
                Leaderboard
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  )
}