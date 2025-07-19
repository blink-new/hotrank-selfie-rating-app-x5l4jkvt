import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Star, Users, HelpCircle, Shield, LogOut, Trash2 } from 'lucide-react-native';
import blink from '@/lib/blink';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    publicProfile: false,
    shareAnalytics: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
        if (state.user) {
          setUser(state.user);

          // Load user profile from database
          const profiles = await blink.db.users.list({
            where: { id: state.user.id },
            limit: 1
          });

          if (profiles.length > 0) {
            setUserProfile(profiles[0]);
          }
        }
        setLoading(state.isLoading);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            blink.auth.logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support to delete your account.');
          }
        }
      ]
    );
  };

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, you'd save this to the database
  };

  const isPremium = userProfile?.subscription_status === 'active';

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF1B6B', '#45CAFF']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#FF1B6B', '#45CAFF']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileContent}>
              <View style={styles.avatarContainer}>
                <User size={40} color="white" />
              </View>
              <Text style={styles.profileName}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Star size={16} color="#000" />
                  <Text style={styles.premiumText}>Premium Member</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Account Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Stats</Text>
          
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Member Since</Text>
              <Text style={styles.statValue}>
                {userProfile?.created_at 
                  ? new Date(userProfile.created_at).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })
                  : 'Recently'
                }
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Subscription Status</Text>
              <Text style={[styles.statValue, { color: isPremium ? '#10B981' : '#6B7280' }]}>
                {isPremium ? 'Premium Active' : 'Free Plan'}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Referrals Made</Text>
              <Text style={styles.statValue}>
                {userProfile?.referrals_count || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Get notified about new features</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
                trackColor={{ false: '#D1D5DB', true: '#FF1B6B' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Public Profile</Text>
                <Text style={styles.settingSubtitle}>Show your profile on leaderboards</Text>
              </View>
              <Switch
                value={settings.publicProfile}
                onValueChange={(value) => updateSetting('publicProfile', value)}
                trackColor={{ false: '#D1D5DB', true: '#FF1B6B' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Share Analytics</Text>
                <Text style={styles.settingSubtitle}>Help improve our AI models</Text>
              </View>
              <Switch
                value={settings.shareAnalytics}
                onValueChange={(value) => updateSetting('shareAnalytics', value)}
                trackColor={{ false: '#D1D5DB', true: '#FF1B6B' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => router.push('/subscription')}
              style={styles.actionButton}
            >
              <View style={styles.actionContent}>
                <Star size={24} color="#F59E0B" />
                <Text style={styles.actionText}>
                  {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                </Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/referrals')}
              style={styles.actionButton}
            >
              <View style={styles.actionContent}>
                <Users size={24} color="#10B981" />
                <Text style={styles.actionText}>Invite Friends</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert('Support', 'Contact us at support@hotpink.app')}
              style={styles.actionButton}
            >
              <View style={styles.actionContent}>
                <HelpCircle size={24} color="#6B7280" />
                <Text style={styles.actionText}>Help & Support</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert('Privacy', 'View our privacy policy at hotpink.app/privacy')}
              style={styles.actionButton}
            >
              <View style={styles.actionContent}>
                <Shield size={24} color="#6B7280" />
                <Text style={styles.actionText}>Privacy Policy</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.actionButton, styles.dangerButton]}
            >
              <View style={styles.actionContent}>
                <LogOut size={24} color="#EF4444" />
                <Text style={[styles.actionText, styles.dangerText]}>Logout</Text>
              </View>
              <Text style={[styles.actionArrow, styles.dangerText]}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={[styles.actionButton, styles.dangerButtonRed]}
            >
              <View style={styles.actionContent}>
                <Trash2 size={24} color="#EF4444" />
                <Text style={[styles.actionText, styles.dangerText]}>Delete Account</Text>
              </View>
              <Text style={[styles.actionArrow, styles.dangerText]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoCard}>
            <Text style={styles.appVersion}>HotPink v1.0.0</Text>
            <Text style={styles.appTagline}>Did you get Pinked today?</Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 32,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingsCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  actionArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerButtonRed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerText: {
    color: '#EF4444',
  },
  appInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  bottomSpacing: {
    height: 80,
  },
});