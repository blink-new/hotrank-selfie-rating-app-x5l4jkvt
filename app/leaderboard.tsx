import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { blink } from '../lib/blink';

interface LeaderboardUser {
  id: string;
  display_name: string;
  current_score: number;
  rank_position: number;
  city: string;
  is_current_user?: boolean;
}

export default function LeaderboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [city, setCity] = useState('New York');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await blink.auth.me();
      setUser(currentUser);

      // Mock user rank data
      setUserRank({
        rank: 234,
        score: 87,
        city: 'New York'
      });

      // Mock leaderboard data
      const mockLeaderboard: LeaderboardUser[] = [
        { id: '1', display_name: 'Emma S.', current_score: 98, rank_position: 1, city: 'New York' },
        { id: '2', display_name: 'Alex M.', current_score: 96, rank_position: 2, city: 'New York' },
        { id: '3', display_name: 'Sarah L.', current_score: 94, rank_position: 3, city: 'New York' },
        { id: '4', display_name: 'Mike R.', current_score: 92, rank_position: 4, city: 'New York' },
        { id: '5', display_name: 'Jessica T.', current_score: 90, rank_position: 5, city: 'New York' },
      ];

      setLeaderboard(mockLeaderboard);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isPremium = user?.subscription_status === 'active';

  const renderLeaderboardItem = (item: LeaderboardUser, index: number) => (
    <View key={item.id} style={styles.leaderboardItem}>
      {/* Rank Badge */}
      <View style={[
        styles.rankBadge,
        index < 3 ? styles.topRankBadge : styles.regularRankBadge
      ]}>
        {index < 3 ? (
          <Ionicons 
            name={index === 0 ? 'trophy' : index === 1 ? 'medal' : 'ribbon'} 
            size={20} 
            color="white" 
          />
        ) : (
          <Text style={styles.rankNumber}>{item.rank_position}</Text>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.display_name || 'Anonymous User'}
        </Text>
        <Text style={styles.userCity}>{item.city}</Text>
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        {isPremium || item.is_current_user ? (
          <Text style={styles.scoreText}>{item.current_score}</Text>
        ) : (
          <View style={styles.lockedScore}>
            <Text style={styles.lockedText}>🔒</Text>
          </View>
        )}
        <Text style={styles.positionText}>#{item.rank_position}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* City Header */}
        <View style={styles.cityContainer}>
          <LinearGradient
            colors={['#FF1B6B', '#45CAFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cityGradient}
          >
            <View style={styles.cityContent}>
              <Ionicons name="location" size={24} color="white" />
              <Text style={styles.cityTitle}>{city}</Text>
              <Text style={styles.citySubtitle}>Hotness Rankings</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Your Rank Card */}
        {userRank && (
          <View style={styles.userRankCard}>
            <View style={styles.userRankContent}>
              <View>
                <Text style={styles.userRankLabel}>Your Rank</Text>
                {isPremium ? (
                  <Text style={styles.userRankNumber}>#{userRank.rank}</Text>
                ) : (
                  <View style={styles.userRankLocked}>
                    <Text style={styles.userRankLockedText}>#???</Text>
                    <Ionicons name="lock-closed" size={20} color="#D1D5DB" style={styles.lockIcon} />
                  </View>
                )}
                <Text style={styles.userScore}>
                  Score: {isPremium ? userRank.score : '🔒'}
                </Text>
              </View>
              <View style={styles.userAvatar}>
                <Ionicons name="person-circle" size={48} color="#FF1B6B" />
                <Text style={styles.userLabel}>You</Text>
              </View>
            </View>

            {!isPremium && (
              <TouchableOpacity 
                onPress={() => router.push('/subscription')}
                style={styles.unlockButton}
              >
                <Text style={styles.unlockButtonText}>
                  Unlock Your Exact Rank 🔓
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Premium Notice */}
        {!isPremium && (
          <View style={styles.premiumNotice}>
            <View style={styles.premiumHeader}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.premiumTitle}>Premium Feature</Text>
            </View>
            <Text style={styles.premiumDescription}>
              Upgrade to see exact scores and your precise ranking position
            </Text>
          </View>
        )}

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          <Text style={styles.leaderboardTitle}>Top Hotties in {city}</Text>
          
          {leaderboard.length > 0 ? (
            leaderboard.map((item, index) => renderLeaderboardItem(item, index))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                No rankings yet in your city.{'\n'}Be the first to set the standard!
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/camera')}
                style={styles.takeSelfieButton}
              >
                <Text style={styles.takeSelfieButtonText}>Take Your Selfie</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  cityContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  cityGradient: {
    borderRadius: 16,
    padding: 24,
  },
  cityContent: {
    alignItems: 'center',
  },
  cityTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  citySubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  userRankCard: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderColor: '#FBCFE8',
    borderWidth: 2,
  },
  userRankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRankLabel: {
    color: '#4B5563',
    fontSize: 14,
  },
  userRankNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  userRankLocked: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRankLockedText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#D1D5DB',
  },
  lockIcon: {
    marginLeft: 8,
  },
  userScore: {
    color: '#6B7280',
    fontSize: 14,
  },
  userAvatar: {
    alignItems: 'center',
  },
  userLabel: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  unlockButton: {
    marginTop: 16,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    padding: 12,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  premiumNotice: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumTitle: {
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8,
  },
  premiumDescription: {
    color: '#B45309',
    fontSize: 14,
    marginTop: 4,
  },
  leaderboardContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  leaderboardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topRankBadge: {
    backgroundColor: '#F59E0B',
  },
  regularRankBadge: {
    backgroundColor: '#F3F4F6',
  },
  rankNumber: {
    color: '#4B5563',
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 16,
  },
  userCity: {
    color: '#6B7280',
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  lockedScore: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  lockedText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  positionText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  takeSelfieButton: {
    marginTop: 16,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  takeSelfieButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 80,
  },
});