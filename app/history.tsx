import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { 
  ArrowLeft, 
  Calendar, 
  Trophy, 
  Camera,
  Video as VideoIcon,
  Share2,
  Instagram,
  Trash2,
  Eye
} from 'lucide-react-native'
import blink from '@/lib/blink'
import { shareToInstagram } from '@/utils/instagram'

interface HistoryEntry {
  id: string
  imageUrl?: string
  videoUrl?: string
  type: 'photo' | 'live_pic'
  score: number
  rankPosition: number
  city: string
  isFiltered: number
  filterType?: string
  createdAt: string
}

export default function History() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isPremium, setIsPremium] = useState(true) // Always true for testing

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadHistory(state.user)
      }
    })
    
    return unsubscribe
  }, [])

  const loadHistory = async (currentUser?: any) => {
    try {
      const userToUse = currentUser || user
      if (!userToUse) return

      // Check premium status
      const userRecord = await blink.db.users.list({
        where: { id: userToUse.id },
        limit: 1
      })
      
      if (userRecord.length > 0) {
        setIsPremium(true) // Always true for testing
      }

      // Load user's selfie history
      const selfies = await blink.db.selfies.list({
        where: { userId: userToUse.id },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })

      setHistory(selfies.map(selfie => ({
        id: selfie.id,
        imageUrl: selfie.imageUrl,
        videoUrl: selfie.videoUrl,
        type: selfie.type as 'photo' | 'live_pic',
        score: selfie.score,
        rankPosition: selfie.rankPosition,
        city: selfie.city,
        isFiltered: selfie.isFiltered,
        filterType: selfie.filterType,
        createdAt: selfie.createdAt
      })))

    } catch (error) {
      console.error('Error loading history:', error)
      Alert.alert('Error', 'Failed to load history. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadHistory()
  }

  const handleShare = async (entry: HistoryEntry) => {
    try {
      const shareData = {
        imageUrl: entry.imageUrl,
        videoUrl: entry.videoUrl,
        score: entry.score,
        rank: entry.rankPosition,
        city: entry.city,
        type: entry.type,
        isPremium: true // Always true for testing
      }

      const success = await shareToInstagram(shareData)
      if (success) {
        Alert.alert('Success', 'Shared to Instagram!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      Alert.alert('Error', 'Failed to share. Please try again.')
    }
  }

  const handleDelete = async (entryId: string) => {
    Alert.alert(
      'Delete Selfie',
      'Are you sure you want to delete this selfie? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await blink.db.selfies.delete(entryId)
              setHistory(prev => prev.filter(item => item.id !== entryId))
              Alert.alert('Success', 'Selfie deleted successfully.')
            } catch (error) {
              console.error('Error deleting selfie:', error)
              Alert.alert('Error', 'Failed to delete selfie. Please try again.')
            }
          }
        }
      ]
    )
  }

  const handleViewDetails = (entry: HistoryEntry) => {
    router.push({
      pathname: '/results',
      params: {
        selfieId: entry.id,
        score: entry.score.toString(),
        rank: entry.rankPosition.toString(),
        city: entry.city,
        imageUrl: entry.imageUrl || '',
        videoUrl: entry.videoUrl || '',
        type: entry.type
      }
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00FF88'
    if (score >= 80) return '#FFD700'
    if (score >= 70) return '#FF8C00'
    return '#FF1B6B'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderHistoryItem = (entry: HistoryEntry, index: number) => (
    <Animated.View
      key={entry.id}
      entering={FadeInDown.duration(600).delay(index * 100)}
      style={{
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Media Thumbnail */}
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 12,
          overflow: 'hidden',
          marginRight: 16,
          backgroundColor: '#f0f0f0'
        }}>
          {entry.type === 'live_pic' && entry.videoUrl ? (
            <Video
              source={{ uri: entry.videoUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isMuted
            />
          ) : entry.imageUrl ? (
            <Image
              source={{ uri: entry.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#e0e0e0'
            }}>
              <Camera size={24} color="#999" />
            </View>
          )}
          
          {/* Type Badge */}
          <View style={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: entry.type === 'live_pic' ? '#FF0000' : '#4CAF50',
            borderRadius: 8,
            paddingHorizontal: 6,
            paddingVertical: 2
          }}>
            {entry.type === 'live_pic' ? (
              <VideoIcon size={10} color="white" />
            ) : (
              <Camera size={10} color="white" />
            )}
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8
          }}>
            <View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: getScoreColor(entry.score)
              }}>
                {entry.score}/100
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#666'
              }}>
                Rank #{entry.rankPosition}
              </Text>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4
              }}>
                <Calendar size={12} color="#666" />
                <Text style={{
                  fontSize: 12,
                  color: '#666',
                  marginLeft: 4
                }}>
                  {formatDate(entry.createdAt)}
                </Text>
              </View>
              
              {entry.filterType && (
                <Text style={{
                  fontSize: 10,
                  color: '#999',
                  fontStyle: 'italic'
                }}>
                  {entry.filterType} filter
                </Text>
              )}
            </View>
          </View>

          <Text style={{
            fontSize: 14,
            color: '#666',
            marginBottom: 12
          }}>
            {entry.city} • {entry.type === 'live_pic' ? 'Live Pic' : 'Photo'}
          </Text>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={() => handleViewDetails(entry)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FF1B6B',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6
              }}
            >
              <Eye size={14} color="white" />
              <Text style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: 'white',
                marginLeft: 4
              }}>
                View
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => handleShare(entry)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#E4405F',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Instagram size={14} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(entry.id)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#FF4444',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Trash2 size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  )

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16, color: 'white' }}>Loading history...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#FF1B6B', '#45CAFF']}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: 60 }}>
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 24
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
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

          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white'
          }}>
            Your History
          </Text>

          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: refreshing ? 0.5 : 1
            }}
          >
            <Calendar size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Premium feature notice removed for testing */}

          {history.length > 0 ? (
            history.map((entry, index) => renderHistoryItem(entry, index))
          ) : (
            <Animated.View 
              entering={FadeInDown.duration(600).delay(200)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                marginTop: 32
              }}
            >
              <Camera size={48} color="rgba(255,255,255,0.6)" />
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginTop: 16,
                marginBottom: 8
              }}>
                No Selfies Yet
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                marginBottom: 24
              }}>
                Take your first selfie to start building your history!
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/camera')}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Camera size={20} color="#FF1B6B" />
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#FF1B6B',
                  marginLeft: 8
                }}>
                  Take Selfie
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </LinearGradient>
  )
}