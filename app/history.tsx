import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { blink } from '../lib/blink';

interface SelfieHistory {
  id: string;
  image_url: string;
  score: number;
  rank: number;
  city: string;
  created_at: string;
  feedback?: string;
}

export default function HistoryScreen() {
  const [user, setUser] = useState<any>(null);
  const [selfies, setSelfies] = useState<SelfieHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await blink.auth.me();
      setUser(currentUser);

      // Mock data for demonstration
      const mockSelfies: SelfieHistory[] = [
        {
          id: '1',
          image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          score: 87,
          rank: 234,
          city: 'New York',
          created_at: new Date().toISOString(),
          feedback: 'Great lighting and angle!'
        },
        {
          id: '2',
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          score: 82,
          rank: 456,
          city: 'New York',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          feedback: 'Try smiling more naturally'
        }
      ];

      setSelfies(mockSelfies);
    } catch (error) {
      console.error('Error loading history:', error);
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#3B82F6';
    if (score >= 70) return '#F59E0B';
    if (score >= 60) return '#F97316';
    return '#EF4444';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { text: 'FIRE', color: '#EF4444' };
    if (score >= 90) return { text: 'HOT', color: '#F97316' };
    if (score >= 80) return { text: 'CUTE', color: '#3B82F6' };
    if (score >= 70) return { text: 'NICE', color: '#10B981' };
    return { text: 'OK', color: '#6B7280' };
  };

  const renderSelfieItem = (selfie: SelfieHistory, index: number) => {
    const badge = getScoreBadge(selfie.score);
    const isRecent = index < 3;
    
    return (
      <TouchableOpacity key={selfie.id} style={[styles.selfieCard, isRecent && styles.recentCard]}>
        <View style={styles.selfieRow}>
          {/* Selfie Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selfie.image_url }}
              style={styles.selfieImage}
              resizeMode="cover"
            />
            {isRecent && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>

          {/* Selfie Info */}
          <View style={styles.selfieInfo}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreText, { color: getScoreColor(selfie.score) }]}>
                  {isPremium ? selfie.score : '🔒'}
                </Text>
                {isPremium && (
                  <View style={[styles.badge, { backgroundColor: badge.color }]}>
                    <Text style={styles.badgeText}>{badge.text}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.rankText}>
                #{isPremium ? selfie.rank : '???'}
              </Text>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#9CA3AF" />
              <Text style={styles.cityText}>{selfie.city}</Text>
            </View>

            <Text style={styles.dateText}>
              {new Date(selfie.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>

            {/* Premium Features */}
            {isPremium && selfie.feedback && (
              <Text style={styles.feedbackText}>
                "{selfie.feedback}"
              </Text>
            )}
          </View>
        </View>

        {/* Premium Upgrade Prompt for Free Users */}
        {!isPremium && (
          <TouchableOpacity
            onPress={() => router.push('/subscription')}
            style={styles.upgradePrompt}
          >
            <Text style={styles.upgradeText}>
              Unlock detailed scores and feedback 🔓
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
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
        <Text style={styles.headerTitle}>Score History</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Overview */}
        {selfies.length > 0 && (
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['#FF1B6B', '#45CAFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsGradient}
            >
              <Text style={styles.statsTitle}>Your Progress</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average Score</Text>
                  <Text style={styles.statValue}>
                    {isPremium ? '85' : '🔒'}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Best Score</Text>
                  <Text style={styles.statValue}>
                    {isPremium ? '87' : '🔒'}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Improvement</Text>
                  <Text style={styles.statValue}>
                    {isPremium ? '+5' : '🔒'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Premium Features Notice */}
        {!isPremium && selfies.length > 0 && (
          <View style={styles.premiumNotice}>
            <View style={styles.premiumHeader}>
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text style={styles.premiumTitle}>Premium Features</Text>
            </View>
            <Text style={styles.premiumDescription}>
              Upgrade to see exact scores, detailed analytics, and personalized feedback
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/subscription')}
              style={styles.upgradeButton}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selfie History List */}
        <View style={styles.historyContainer}>
          {selfies.length > 0 ? (
            <>
              <Text style={styles.historyTitle}>
                Your Selfies ({selfies.length})
              </Text>
              {selfies.map(renderSelfieItem)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No selfies yet</Text>
              <Text style={styles.emptyDescription}>
                Take your first selfie to start building your score history
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/camera')}
                style={styles.takeSelfieButton}
              >
                <Text style={styles.takeSelfieButtonText}>Take Selfie</Text>
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
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statsGradient: {
    borderRadius: 16,
    padding: 24,
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
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
  upgradeButton: {
    marginTop: 12,
    backgroundColor: '#FDE68A',
    borderRadius: 12,
    paddingVertical: 8,
  },
  upgradeButtonText: {
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '600',
  },
  historyContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  historyTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selfieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentCard: {
    borderColor: '#FBCFE8',
    borderWidth: 2,
  },
  selfieRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
  },
  selfieImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selfieInfo: {
    flex: 1,
    marginLeft: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rankText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cityText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 4,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  feedbackText: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  upgradePrompt: {
    marginTop: 12,
    backgroundColor: '#FCE7F3',
    borderRadius: 12,
    padding: 12,
    borderColor: '#FBCFE8',
    borderWidth: 1,
  },
  upgradeText: {
    color: '#BE185D',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#6B7280',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyDescription: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  takeSelfieButton: {
    marginTop: 24,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  takeSelfieButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomSpacing: {
    height: 80,
  },
});