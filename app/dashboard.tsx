import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from 'react-native-reanimated'
import { 
  Camera, 
  Trophy, 
  Crown, 
  TrendingUp,
  Users,
  Settings,
  Star,
  Zap,
  Video as VideoIcon,
  Calendar,
  Award,
  Target
} from 'lucide-react-native'
import blink from '@/lib/blink'

const { width } = Dimensions.get('window')

interface UserStats {
  totalSelfies: number
  averageScore: number
  bestScore: number
  currentRank: number
  city: string
  weeklyRank: number
  monthlyRank: number
}

interface RecentSelfie {
  id: string
  imageUrl?: string
  videoUrl?: string
  type: string
  score: number
  rank: number
  city: string
  createdAt: string
  filterType?: string
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [isPremium, setIsPremium] = useState(true) // Always true for testing
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentSelfies, setRecentSelfies] = useState<RecentSelfie[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadDashboardData(state.user)
      }
    })
    
    return unsubscribe
  }, [])

  const loadDashboardData = async (currentUser: any) => {
    try {
      setLoading(true)
      
      // Check premium status
      await checkPremiumStatus(currentUser)
      
      // Load user stats
      await loadUserStats(currentUser)
      
      // Load recent selfies
      await loadRecentSelfies(currentUser)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPremiumStatus = async (user: any) => {
    // Always set as premium for testing
    setIsPremium(true)
  }

  const loadUserStats = async (currentUser: any) => {
    try {
      // Get all user's selfies
      const selfies = await blink.db.selfies.list({
        where: { userId: currentUser.id },
        orderBy: { createdAt: 'desc' }
      })

      if (selfies.length === 0) {
        setUserStats({
          totalSelfies: 0,
          averageScore: 0,
          bestScore: 0,
          currentRank: 0,
          city: 'Unknown',
          weeklyRank: 0,
          monthlyRank: 0
        })
        return
      }

      // Calculate stats
      const totalSelfies = selfies.length
      const scores = selfies.map(s => s.score)
      const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      const bestScore = Math.max(...scores)
      
      // Get latest selfie for current rank and city
      const latestSelfie = selfies[0]
      const currentRank = latestSelfie.rankPosition || 0
      const city = latestSelfie.city || 'Unknown'

      // Get weekly and monthly ranks (simplified - would need more complex logic in production)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const weeklySelfies = selfies.filter(s => s.createdAt >= weekAgo)
      const monthlySelfies = selfies.filter(s => s.createdAt >= monthAgo)
      
      const weeklyRank = weeklySelfies.length > 0 ? Math.min(...weeklySelfies.map(s => s.rankPosition)) : 0
      const monthlyRank = monthlySelfies.length > 0 ? Math.min(...monthlySelfies.map(s => s.rankPosition)) : 0

      setUserStats({
        totalSelfies,
        averageScore,
        bestScore,
        currentRank,
        city,
        weeklyRank,
        monthlyRank
      })

    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const loadRecentSelfies = async (currentUser: any) => {
    try {
      const selfies = await blink.db.selfies.list({
        where: { userId: currentUser.id },
        orderBy: { createdAt: 'desc' },
        limit: 10
      })

      setRecentSelfies(selfies.map(selfie => ({
        id: selfie.id,
        imageUrl: selfie.imageUrl,
        videoUrl: selfie.videoUrl,
        type: selfie.type || 'photo',
        score: selfie.score,
        rank: selfie.rankPosition,
        city: selfie.city || 'Unknown',
        createdAt: selfie.createdAt,
        filterType: selfie.filterType
      })))

    } catch (error) {
      console.error('Error loading recent selfies:', error)
    }
  }

  const onRefresh = async () => {
    if (!user) return
    setRefreshing(true)
    await loadDashboardData(user)
    setRefreshing(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#00FF88'
    if (score >= 80) return '#FFD700'
    if (score >= 70) return '#FF8C00'
    return '#FF1B6B'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return `${Math.floor(diffInDays / 7)}w ago`
  }

  const handleTakeSelfie = () => {
    router.push('/camera')
  }

  const handleViewLeaderboard = () => {
    router.push('/leaderboard')
  }

  const handleUpgrade = () => {
    router.push('/subscription')
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  const handleViewSelfie = (selfie: RecentSelfie) => {
    router.push({
      pathname: '/results',
      params: {
        selfieId: selfie.id,
        score: selfie.score.toString(),
        rank: selfie.rank.toString(),
        city: selfie.city,
        imageUrl: selfie.imageUrl || '',
        videoUrl: selfie.videoUrl || '',
        type: selfie.type
      }
    })
  }

  if (loading) {
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
            Loading Dashboard
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center'
          }}>
            Getting your latest stats...
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
        }
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.duration(600)}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 60,
            marginBottom: 32
          }}
        >
          <View>
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: 'white'
            }}>
              Hey {user?.displayName || user?.email?.split('@')[0] || 'there'}! 👋
            </Text>
            <Text style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 4
            }}>
              Ready to get Pinked today?
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleProfile}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Settings size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        {userStats && (
          <Animated.View 
            entering={FadeInLeft.duration(600).delay(100)}
            style={{
              flexDirection: 'row',
              paddingHorizontal: 24,
              marginBottom: 32,
              gap: 12
            }}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}>
              <Star size={24} color="#FFD700" />
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginTop: 8
              }}>
                {userStats.bestScore}
              </Text>
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center'
              }}>
                Best Score
              </Text>
            </View>

            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}>
              <Trophy size={24} color="#FFD700" />
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginTop: 8
              }}>
                #{userStats.currentRank}
              </Text>
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center'
              }}>
                Current Rank
              </Text>
            </View>

            <View style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}>
              <Camera size={24} color="#FFD700" />
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
                marginTop: 8
              }}>
                {userStats.totalSelfies}
              </Text>
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center'
              }}>
                Total Selfies
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Main Action Button */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={{
            paddingHorizontal: 24,
            marginBottom: 32
          }}
        >
          <TouchableOpacity
            onPress={handleTakeSelfie}
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 16
            }}
          >
            <Camera size={28} color="#FF1B6B" />
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FF1B6B',
              marginLeft: 12
            }}>
              Take New Selfie
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Premium Upgrade section removed for testing */}

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(400)}
          style={{
            flexDirection: 'row',
            paddingHorizontal: 24,
            marginBottom: 32,
            gap: 12
          }}
        >
          <TouchableOpacity
            onPress={handleViewLeaderboard}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Users size={24} color="white" />
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: 'white',
              marginTop: 8,
              textAlign: 'center'
            }}>
              Leaderboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/history')}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Calendar size={24} color="white" />
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: 'white',
              marginTop: 8,
              textAlign: 'center'
            }}>
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/referrals')}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Award size={24} color="white" />
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: 'white',
              marginTop: 8,
              textAlign: 'center'
            }}>
              Referrals
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Selfies */}
        {recentSelfies.length > 0 && (
          <Animated.View 
            entering={FadeInUp.duration(600).delay(500)}
            style={{
              paddingHorizontal: 24,
              marginBottom: 32
            }}
          >
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 16
            }}>
              Recent Selfies
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentSelfies.slice(0, 5).map((selfie, index) => (
                <TouchableOpacity
                  key={selfie.id}
                  onPress={() => handleViewSelfie(selfie)}
                  style={{
                    width: 120,
                    marginRight: 12,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    overflow: 'hidden'
                  }}
                >
                  <View style={{
                    width: '100%',
                    height: 150,
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }}>
                    {selfie.type === 'live_pic' && selfie.videoUrl ? (
                      <Video
                        source={{ uri: selfie.videoUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isMuted
                      />
                    ) : selfie.imageUrl ? (
                      <Image
                        source={{ uri: selfie.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Camera size={32} color="rgba(255,255,255,0.5)" />
                      </View>
                    )}
                    
                    {/* Live Pic Badge */}
                    {selfie.type === 'live_pic' && (
                      <View style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: '#FF0000',
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}>
                        <VideoIcon size={8} color="white" />
                        <Text style={{
                          fontSize: 8,
                          fontWeight: 'bold',
                          color: 'white',
                          marginLeft: 2
                        }}>
                          LIVE
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={{ padding: 12 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: getScoreColor(selfie.score),
                      textAlign: 'center'
                    }}>
                      {selfie.score}
                    </Text>
                    <Text style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.6)',
                      textAlign: 'center',
                      marginTop: 2
                    }}>
                      {formatTimeAgo(selfie.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Empty State */}
        {recentSelfies.length === 0 && (
          <Animated.View 
            entering={FadeInUp.duration(600).delay(500)}
            style={{
              paddingHorizontal: 24,
              marginBottom: 32,
              alignItems: 'center'
            }}
          >
            <Camera size={64} color="rgba(255,255,255,0.3)" />
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginTop: 16,
              marginBottom: 8
            }}>
              No selfies yet!
            </Text>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              marginBottom: 24
            }}>
              Take your first selfie to get started and see how you rank!
            </Text>
            <TouchableOpacity
              onPress={handleTakeSelfie}
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24
              }}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#FF1B6B'
              }}>
                Take First Selfie
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  )
}