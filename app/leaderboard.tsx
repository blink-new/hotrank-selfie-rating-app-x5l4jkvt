import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { 
  Trophy, 
  Medal, 
  Crown, 
  ArrowLeft, 
  RefreshCw, 
  MapPin,
  Star,
  Lock,
  Camera,
  Users,
  Share2,
  Instagram
} from 'lucide-react-native'
import blink from '@/lib/blink'
import { InstagramShare } from '@/utils/instagram'

interface LeaderboardEntry {
  id: string
  userId: string
  displayName: string
  score: number
  rankPosition: number
  city: string
  imageUrl?: string
  videoUrl?: string
  type: 'photo' | 'live_pic'
  createdAt: string
  isCurrentUser?: boolean
}

export default function LeaderboardScreen() {
  const [user, setUser] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isPremium, setIsPremium] = useState(true) // Always true for testing
  const [city, setCity] = useState('Your City')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadData(state.user)
      }
    })
    
    return unsubscribe
  }, [])

  const loadData = async (currentUser?: any) => {
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
        setCity(userRecord[0].city || 'Your City')
      }

      // Load leaderboard data
      const leaderboardData = await blink.db.leaderboard.list({
        where: { city: city },
        orderBy: { rankPosition: 'asc' },
        limit: 50
      })

      // Get user details for each leaderboard entry
      const enrichedLeaderboard: LeaderboardEntry[] = []
      
      for (const entry of leaderboardData) {
        try {
          // Get user info
          const userInfo = await blink.db.users.list({
            where: { id: entry.userId },
            limit: 1
          })
          
          // Get selfie info
          const selfieInfo = await blink.db.selfies.list({
            where: { id: entry.selfieId },
            limit: 1
          })

          if (userInfo.length > 0 && selfieInfo.length > 0) {
            const selfie = selfieInfo[0]
            enrichedLeaderboard.push({
              id: entry.id,
              userId: entry.userId,
              displayName: userInfo[0].displayName || userInfo[0].email?.split('@')[0] || 'Anonymous',
              score: entry.score,
              rankPosition: entry.rankPosition,
              city: entry.city,
              imageUrl: selfie.imageUrl,
              videoUrl: selfie.videoUrl,
              type: selfie.type as 'photo' | 'live_pic',
              createdAt: entry.createdAt,
              isCurrentUser: entry.userId === userToUse.id
            })
          }
        } catch (error) {
          console.error('Error enriching leaderboard entry:', error)
        }
      }

      setLeaderboard(enrichedLeaderboard)

      // Find current user's rank
      const currentUserEntry = enrichedLeaderboard.find(entry => entry.isCurrentUser)
      if (currentUserEntry) {
        setUserRank({
          rank: currentUserEntry.rankPosition,
          score: currentUserEntry.score,
          city: currentUserEntry.city
        })
      } else {
        // If user not in top 50, get their rank from database
        const userSelfies = await blink.db.selfies.list({
          where: { userId: userToUse.id },
          orderBy: { createdAt: 'desc' },
          limit: 1
        })
        
        if (userSelfies.length > 0) {
          const latestSelfie = userSelfies[0]
          setUserRank({
            rank: latestSelfie.rankPosition,
            score: latestSelfie.score,
            city: latestSelfie.city
          })
        }
      }

    } catch (error) {
      console.error('Error loading leaderboard:', error)
      Alert.alert('Error', 'Failed to load leaderboard. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleShareLeaderboard = async (entry: LeaderboardEntry) => {
    try {
      const shareData = {
        imageUrl: entry.imageUrl,
        videoUrl: entry.videoUrl,
        score: entry.score,
        rank: entry.rankPosition,
        city: entry.city,
        type: entry.type
      }

      const success = await InstagramShare.shareToInstagram(shareData)
      if (success) {
        Alert.alert('Success', 'Shared to Instagram!')
      }
    } catch (error) {
      console.error('Error sharing to Instagram:', error)
      Alert.alert('Error', 'Failed to share to Instagram. Please try again.')
    }
  }

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown size={24} color="#FFD700" />
    if (position === 2) return <Medal size={24} color="#C0C0C0" />
    if (position === 3) return <Trophy size={24} color="#CD7F32" />
    return null
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00FF88'
    if (score >= 80) return '#FFD700'
    if (score >= 70) return '#FF8C00'
    return '#FF1B6B'
  }

  const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => (
    <Animated.View 
      key={entry.id}
      entering={FadeInDown.duration(600).delay(index * 100)}
      style={{
        backgroundColor: entry.isCurrentUser ? 'rgba(255, 27, 107, 0.1)' : 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: entry.isCurrentUser ? 2 : 0,
        borderColor: entry.isCurrentUser ? '#FF1B6B' : 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
      }}
    >
      {/* Rank Badge */}
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: entry.rankPosition <= 3 ? '#FFD700' : 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
      }}>
        {getRankIcon(entry.rankPosition) || (
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: entry.rankPosition <= 3 ? '#000' : '#666'
          }}>
            {entry.rankPosition}
          </Text>
        )}
      </View>

      {/* Profile Image */}
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: '#f0f0f0'
      }}>
        {entry.imageUrl ? (
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
            <Users size={24} color="#999" />
          </View>
        )}
        
        {/* Live Pic Badge */}
        {entry.type === 'live_pic' && (
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: '#FF0000',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 8,
              color: 'white',
              fontWeight: 'bold'
            }}>
              L
            </Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 4
        }}>
          {entry.displayName}
          {entry.isCurrentUser && (
            <Text style={{ color: '#FF1B6B', fontSize: 14 }}> (You)</Text>
          )}
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <MapPin size={12} color="#666" />
          <Text style={{
            fontSize: 12,
            color: '#666',
            marginLeft: 4
          }}>
            {entry.city}
          </Text>
        </View>
      </View>

      {/* Score */}
      <View style={{ alignItems: 'center', marginRight: 12 }}>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: getScoreColor(entry.score)
        }}>
          {entry.score}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#666'
        }}>
          Score
        </Text>
      </View>

      {/* Share Button */}
      <TouchableOpacity
        onPress={() => handleShareLeaderboard(entry)}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#E4405F',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Instagram size={16} color="white" />
      </TouchableOpacity>
    </Animated.View>
  )

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16, color: 'white' }}>Loading leaderboard...</Text>
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

          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white'
            }}>
              Leaderboard
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4
            }}>
              <MapPin size={12} color="rgba(255,255,255,0.8)" />
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                marginLeft: 4
              }}>
                {city}
              </Text>
            </View>
          </View>

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
            <RefreshCw size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Your Rank Card */}
        {userRank && (
          <Animated.View 
            entering={FadeInDown.duration(600).delay(100)}
            style={{
              marginHorizontal: 24,
              marginBottom: 24,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: 20
            }}
          >
            <Text style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.8)',
              marginBottom: 12,
              textAlign: 'center'
            }}>
              Your Current Rank
            </Text>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#FFD700'
                }}>
                  #{userRank.rank}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Position
                </Text>
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: getScoreColor(userRank.score)
                }}>
                  {userRank.score}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  Score
                </Text>
              </View>
            </View>

            {/* Premium upgrade button removed for testing */}
          </Animated.View>
        )}

        {/* Leaderboard List */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(600).delay(200)}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 16,
              textAlign: 'center'
            }}>
              🔥 Top Hotties in {city}
            </Text>
          </Animated.View>

          {/* Premium feature notice removed for testing */}

          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => renderLeaderboardItem(entry, index))
          ) : (
            <Animated.View 
              entering={FadeInDown.duration(600).delay(400)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                marginTop: 32
              }}
            >
              <Users size={48} color="rgba(255,255,255,0.6)" />
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginTop: 16,
                marginBottom: 8
              }}>
                No Rankings Yet
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                marginBottom: 24
              }}>
                Be the first to set the standard in {city}!
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
                  Take Your Selfie
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