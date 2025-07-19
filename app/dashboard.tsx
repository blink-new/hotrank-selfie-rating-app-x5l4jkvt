import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { 
  Camera, 
  Trophy, 
  Users, 
  Settings, 
  Crown, 
  Zap,
  Gift,
  History,
  Star
} from 'lucide-react-native'
import blink from '@/lib/blink'

const { width } = Dimensions.get('window')

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    currentScore: null,
    cityRank: null,
    totalRatings: 0,
    isPremium: false
  })

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (!state.user && !state.isLoading) {
        router.replace('/')
      }
    })
    
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadUserStats()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      // Load user's latest selfie score and stats
      const selfies = await blink.db.selfies.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        limit: 1
      })

      // Get total count of selfies
      const allSelfies = await blink.db.selfies.list({
        where: { user_id: user.id }
      })

      // Check user subscription status
      const userProfile = await blink.db.users.list({
        where: { id: user.id },
        limit: 1
      })

      const isPremium = userProfile[0]?.subscription_status === 'premium' || 
                       userProfile[0]?.subscription_status === 'trial'

      if (selfies.length > 0) {
        const latestSelfie = selfies[0]
        setUserStats(prev => ({
          ...prev,
          currentScore: Number(latestSelfie.score),
          cityRank: Number(latestSelfie.rank),
          totalRatings: allSelfies.length,
          isPremium: isPremium
        }))
      } else {
        setUserStats(prev => ({
          ...prev,
          totalRatings: 0,
          isPremium: isPremium
        }))
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleTakeSelfie = () => {
    router.push('/camera')
  }

  const handleViewLeaderboard = () => {
    router.push('/leaderboard')
  }

  const handleViewHistory = () => {
    router.push('/history')
  }

  const handleUpgradeToPremium = () => {
    router.push('/subscription')
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ fontSize: 16, color: 'white' }}>Loading...</Text>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#FF1B6B', '#45CAFF']}
      style={{ flex: 1 }}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
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
            <View>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: 'white'
              }}>
                Welcome back!
              </Text>
              <Text style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.8)'
              }}>
                {user?.email || 'User'}
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

          {/* Current Score Card */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(100)}
            style={{ marginBottom: 24 }}
          >
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center'
            }}>
              {userStats.currentScore ? (
                <>
                  <Text style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: 8
                  }}>
                    Your Current Score
                  </Text>
                  <Text style={{
                    fontSize: 48,
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: 8
                  }}>
                    {userStats.isPremium ? userStats.currentScore : '••'}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    textAlign: 'center'
                  }}>
                    {userStats.isPremium 
                      ? `Rank #${userStats.cityRank} in your city`
                      : 'Upgrade to see your exact score and ranking'
                    }
                  </Text>
                  {!userStats.isPremium && (
                    <TouchableOpacity
                      onPress={handleUpgradeToPremium}
                      style={{
                        backgroundColor: '#FFD700',
                        borderRadius: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        marginTop: 12,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    >
                      <Crown size={16} color="#000" />
                      <Text style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#000',
                        marginLeft: 4
                      }}>
                        Unlock Premium
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <>
                  <Star size={48} color="rgba(255,255,255,0.6)" />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: 'white',
                    marginTop: 16,
                    marginBottom: 8
                  }}>
                    Ready for your first rating?
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.8)',
                    textAlign: 'center'
                  }}>
                    Take a selfie to get Pinked today!
                  </Text>
                </>
              )}
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(200)}
            style={{ marginBottom: 32 }}
          >
            <TouchableOpacity
              onPress={handleTakeSelfie}
              style={{
                backgroundColor: 'white',
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
              <Camera size={24} color="#FF1B6B" />
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#FF1B6B',
                marginLeft: 12
              }}>
                {userStats.currentScore ? 'Take New Selfie' : 'Take Your First Selfie'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions Grid */}
          <Animated.View 
            entering={FadeInDown.duration(600).delay(300)}
            style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between',
              marginBottom: 32
            }}
          >
            <QuickActionCard
              icon={<Trophy size={24} color="#FF1B6B" />}
              title="Leaderboard"
              subtitle="City rankings"
              onPress={handleViewLeaderboard}
            />
            <QuickActionCard
              icon={<History size={24} color="#FF1B6B" />}
              title="History"
              subtitle="Past ratings"
              onPress={handleViewHistory}
            />
            <QuickActionCard
              icon={<Gift size={24} color="#FF1B6B" />}
              title="Referrals"
              subtitle="Invite friends"
              onPress={() => router.push('/referrals')}
            />
            <QuickActionCard
              icon={<Crown size={24} color="#FFD700" />}
              title="Premium"
              subtitle="Upgrade now"
              onPress={handleUpgradeToPremium}
            />
          </Animated.View>

          {/* Stats */}
          {userStats.totalRatings > 0 && (
            <Animated.View 
              entering={FadeInDown.duration(600).delay(400)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: 20
              }}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 16
              }}>
                Your Stats
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <StatItem label="Total Ratings" value={userStats.totalRatings.toString()} />
                <StatItem label="Best Score" value={userStats.isPremium ? userStats.currentScore?.toString() || '0' : '••'} />
                <StatItem label="City Rank" value={userStats.isPremium ? `#${userStats.cityRank}` : '••'} />
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

function QuickActionCard({ icon, title, subtitle, onPress }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 16,
        padding: 16,
        width: (width - 64) / 2,
        marginBottom: 16,
        alignItems: 'center'
      }}
    >
      <View style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,27,107,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12
      }}>
        {icon}
      </View>
      <Text style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: 12,
        color: '#666',
        textAlign: 'center'
      }}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)'
      }}>
        {label}
      </Text>
    </View>
  )
}