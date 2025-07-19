import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { blink } from '../lib/blink';

interface Referral {
  id: string;
  referred_user_id: string;
  referred_user_name: string;
  status: 'pending' | 'converted';
  created_at: string;
  reward_earned: number;
}

export default function ReferralsScreen() {
  const [user, setUser] = useState<any>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    convertedReferrals: 0,
    totalRewards: 0,
    freeWeeksEarned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await blink.auth.me();
      setUser(currentUser);

      // Mock referral data
      const mockReferrals: Referral[] = [
        {
          id: '1',
          referred_user_id: 'user1',
          referred_user_name: 'Sarah M.',
          status: 'converted',
          created_at: new Date().toISOString(),
          reward_earned: 5
        },
        {
          id: '2',
          referred_user_id: 'user2',
          referred_user_name: 'Mike R.',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          reward_earned: 0
        }
      ];

      setReferrals(mockReferrals);

      // Calculate stats
      const converted = mockReferrals.filter(r => r.status === 'converted').length;
      const totalRewards = converted * 5;
      const freeWeeks = Math.floor(converted / 2);

      setStats({
        totalReferrals: mockReferrals.length,
        convertedReferrals: converted,
        totalRewards,
        freeWeeksEarned: freeWeeks
      });
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = () => {
    return user?.id ? user.id.slice(-8).toUpperCase() : 'HOTPINK';
  };

  const getReferralLink = () => {
    const code = generateReferralCode();
    return `https://hotpink.app/join?ref=${code}`;
  };

  const handleShare = async () => {
    try {
      const link = getReferralLink();
      const message = `🔥 Join me on HotPink - the AI selfie rating app! Use my code ${generateReferralCode()} and we both get rewards! ${link}`;
      
      await Share.share({
        message,
        title: 'Join HotPink with my referral code!'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const link = getReferralLink();
      await Clipboard.setStringAsync(link);
      Alert.alert('Copied!', 'Referral link copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleCopyCode = async () => {
    try {
      const code = generateReferralCode();
      await Clipboard.setStringAsync(code);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  const renderReferralItem = (referral: Referral) => (
    <View key={referral.id} style={styles.referralItem}>
      <View style={styles.referralContent}>
        <View style={styles.referralInfo}>
          <Text style={styles.referralName}>
            {referral.referred_user_name || 'New User'}
          </Text>
          <Text style={styles.referralDate}>
            {new Date(referral.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.referralStatus}>
          <View style={[
            styles.statusBadge,
            referral.status === 'converted' ? styles.convertedBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.statusText,
              referral.status === 'converted' ? styles.convertedText : styles.pendingText
            ]}>
              {referral.status === 'converted' ? 'Converted' : 'Pending'}
            </Text>
          </View>
          {referral.status === 'converted' && (
            <Text style={styles.rewardText}>
              +${referral.reward_earned}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading referrals...</Text>
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
        <Text style={styles.headerTitle}>Refer Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={['#FF1B6B', '#45CAFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Ionicons name="people" size={48} color="white" />
              <Text style={styles.heroTitle}>
                Invite Friends, Get Rewards
              </Text>
              <Text style={styles.heroSubtitle}>
                Earn $5 for every friend who joins premium
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Referrals</Text>
              <Text style={[styles.statValue, { color: '#EC4899' }]}>{stats.totalReferrals}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Converted</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{stats.convertedReferrals}</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>${stats.totalRewards}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Free Weeks</Text>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>{stats.freeWeeksEarned}</Text>
            </View>
          </View>
        </View>

        {/* Referral Code Section */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeTitle}>Your Referral Code</Text>
          
          <View style={styles.codeCard}>
            <View style={styles.codeContent}>
              <Text style={styles.codeDescription}>Share this code with friends</Text>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>
                  {generateReferralCode()}
                </Text>
              </View>
              
              <View style={styles.codeButtons}>
                <TouchableOpacity
                  onPress={handleCopyCode}
                  style={[styles.codeButton, styles.copyCodeButton]}
                >
                  <Ionicons name="copy" size={20} color="#374151" />
                  <Text style={styles.copyCodeText}>Copy Code</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleCopyLink}
                  style={[styles.codeButton, styles.copyLinkButton]}
                >
                  <Ionicons name="link" size={20} color="#3B82F6" />
                  <Text style={styles.copyLinkText}>Copy Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Share Button */}
        <View style={styles.shareContainer}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
          >
            <Ionicons name="share" size={24} color="white" />
            <Text style={styles.shareButtonText}>Share with Friends</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.howItWorksTitle}>How It Works</Text>
          
          <View style={styles.howItWorksCard}>
            <View style={styles.stepContainer}>
              <View style={[styles.stepNumber, { backgroundColor: '#FBCFE8' }]}>
                <Text style={[styles.stepNumberText, { color: '#BE185D' }]}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Your Code</Text>
                <Text style={styles.stepDescription}>Send your referral code to friends via social media, text, or email</Text>
              </View>
            </View>
            
            <View style={styles.stepContainer}>
              <View style={[styles.stepNumber, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.stepNumberText, { color: '#1D4ED8' }]}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Friend Joins</Text>
                <Text style={styles.stepDescription}>They download HotPink and enter your code during signup</Text>
              </View>
            </View>
            
            <View style={styles.stepContainer}>
              <View style={[styles.stepNumber, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.stepNumberText, { color: '#047857' }]}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Earn Rewards</Text>
                <Text style={styles.stepDescription}>Get $5 when they upgrade to premium, plus free weeks for yourself!</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Referral History */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Referral History</Text>
          
          {referrals.length > 0 ? (
            referrals.map(renderReferralItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No referrals yet</Text>
              <Text style={styles.emptyDescription}>
                Start sharing your code to earn rewards!
              </Text>
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
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  heroGradient: {
    borderRadius: 16,
    padding: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 18,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  codeContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  codeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  codeContent: {
    alignItems: 'center',
  },
  codeDescription: {
    color: '#4B5563',
    marginBottom: 8,
  },
  codeDisplay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EC4899',
    textAlign: 'center',
  },
  codeButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  codeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  copyCodeButton: {
    backgroundColor: '#F3F4F6',
  },
  copyCodeText: {
    color: '#374151',
    fontWeight: '600',
    marginLeft: 8,
  },
  copyLinkButton: {
    backgroundColor: '#DBEAFE',
  },
  copyLinkText: {
    color: '#1D4ED8',
    fontWeight: '600',
    marginLeft: 8,
  },
  shareContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  shareButton: {
    backgroundColor: '#EC4899',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  howItWorksContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  howItWorksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  stepDescription: {
    color: '#4B5563',
    fontSize: 14,
  },
  historyContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  referralItem: {
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
  referralContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    color: '#111827',
    fontWeight: '600',
  },
  referralDate: {
    color: '#6B7280',
    fontSize: 14,
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  convertedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  convertedText: {
    color: '#047857',
  },
  pendingText: {
    color: '#92400E',
  },
  rewardText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#6B7280',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyDescription: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 80,
  },
});