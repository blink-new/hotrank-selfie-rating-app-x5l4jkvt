import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { blink } from '../lib/blink';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'weekly',
    name: 'Weekly Premium',
    price: '$3.99',
    period: 'week',
    features: [
      'Unlimited daily re-ranks',
      'Exact leaderboard position',
      'Detailed score breakdown',
      'Score history & trends',
      'Priority support',
      'No ads'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Premium',
    price: '$12.99',
    period: 'month',
    popular: true,
    savings: 'Save 18%',
    features: [
      'Everything in Weekly',
      'Advanced analytics',
      'Comparison tools',
      'Exclusive filters',
      'Early access to features',
      'Premium badge'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly Premium',
    price: '$99.99',
    period: 'year',
    savings: 'Save 36%',
    features: [
      'Everything in Monthly',
      'Lifetime score archive',
      'Custom city selection',
      'VIP customer support',
      'Exclusive community access',
      'Annual insights report'
    ]
  }
];

const freeFeatures = [
  'Basic AI selfie scoring',
  '1 score per day',
  'General rank estimate',
  'Basic leaderboard view'
];

export default function SubscriptionScreen() {
  const [user, setUser] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await blink.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      Alert.alert(
        'Subscription',
        `Starting ${planId} subscription...`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Continue',
            onPress: async () => {
              Alert.alert(
                'Success! 🎉',
                'Welcome to HotPink Premium! You now have access to all premium features.',
                [{ text: 'OK', onPress: () => router.back() }]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = user?.subscription_status === 'active';

  const renderFeature = (feature: string, included: boolean = true) => (
    <View key={feature} style={styles.featureRow}>
      <Ionicons 
        name={included ? 'checkmark-circle' : 'close-circle'} 
        size={20} 
        color={included ? '#10B981' : '#EF4444'} 
      />
      <Text style={[styles.featureText, !included && styles.featureTextDisabled]}>
        {feature}
      </Text>
    </View>
  );

  const renderPricingCard = (plan: PricingPlan) => (
    <TouchableOpacity
      key={plan.id}
      onPress={() => setSelectedPlan(plan.id)}
      style={[
        styles.pricingCard,
        selectedPlan === plan.id && styles.selectedCard
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBadgeContainer}>
          <LinearGradient
            colors={['#FF1B6B', '#45CAFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.popularBadge}
          >
            <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
          </LinearGradient>
        </View>
      )}

      <View style={styles.planHeader}>
        <View>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.savings && (
            <Text style={styles.planSavings}>{plan.savings}</Text>
          )}
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planPeriod}>/{plan.period}</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map(feature => renderFeature(feature))}
      </View>

      {selectedPlan === plan.id && (
        <TouchableOpacity
          onPress={() => handleSubscribe(plan.id)}
          disabled={loading}
          style={styles.subscribeButton}
        >
          <Text style={styles.subscribeButtonText}>
            {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isPremium ? 'Manage Subscription' : 'Go Premium'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Premium Status */}
        {isPremium && (
          <View style={styles.premiumStatusContainer}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumStatusGradient}
            >
              <View style={styles.premiumStatusContent}>
                <Ionicons name="star" size={24} color="white" />
                <Text style={styles.premiumStatusTitle}>Premium Active</Text>
              </View>
              <Text style={styles.premiumStatusDescription}>
                You're enjoying all premium features! 🎉
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Hero Section */}
        {!isPremium && (
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['#FF1B6B', '#45CAFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Ionicons name="star" size={48} color="white" />
                <Text style={styles.heroTitle}>
                  Unlock Your True Potential
                </Text>
                <Text style={styles.heroSubtitle}>
                  Get detailed insights, unlimited ranks, and climb the leaderboard
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Free vs Premium Comparison */}
        <View style={styles.comparisonContainer}>
          <Text style={styles.comparisonTitle}>
            Free vs Premium
          </Text>

          <View style={styles.comparisonRow}>
            {/* Free Column */}
            <View style={styles.comparisonColumn}>
              <Text style={styles.columnTitle}>Free</Text>
              <View style={styles.columnFeatures}>
                {freeFeatures.map(feature => renderFeature(feature))}
                <View style={styles.featureDivider} />
                {renderFeature('Unlimited re-ranks', false)}
                {renderFeature('Exact rankings', false)}
                {renderFeature('Score history', false)}
              </View>
            </View>

            {/* Premium Column */}
            <View style={[styles.comparisonColumn, styles.premiumColumn]}>
              <Text style={styles.premiumColumnTitle}>Premium</Text>
              <View style={styles.columnFeatures}>
                {freeFeatures.map(feature => renderFeature(feature))}
                <View style={styles.premiumFeatureDivider} />
                {renderFeature('Unlimited re-ranks')}
                {renderFeature('Exact rankings')}
                {renderFeature('Score history')}
                {renderFeature('Advanced analytics')}
              </View>
            </View>
          </View>
        </View>

        {/* Pricing Plans */}
        {!isPremium && (
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>
              Choose Your Plan
            </Text>
            {pricingPlans.map(renderPricingCard)}
          </View>
        )}

        {/* Testimonials */}
        <View style={styles.testimonialsContainer}>
          <Text style={styles.testimonialsTitle}>What Users Say</Text>
          
          <View style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <View style={styles.starsContainer}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={16} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.testimonialAuthor}>Sarah M.</Text>
            </View>
            <Text style={styles.testimonialText}>
              "The detailed analytics helped me understand what makes a great selfie. My scores improved by 20 points!"
            </Text>
          </View>

          <View style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <View style={styles.starsContainer}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={16} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.testimonialAuthor}>Mike R.</Text>
            </View>
            <Text style={styles.testimonialText}>
              "Love seeing my exact rank and competing with friends. The unlimited re-ranks are a game changer!"
            </Text>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Frequently Asked</Text>
          
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes! You can cancel your subscription at any time. You'll keep premium features until the end of your billing period.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Is my data secure?</Text>
            <Text style={styles.faqAnswer}>
              Absolutely. We use enterprise-grade encryption and never share your photos or personal data with third parties.
            </Text>
          </View>
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
  premiumStatusContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  premiumStatusGradient: {
    borderRadius: 16,
    padding: 24,
  },
  premiumStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumStatusTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  premiumStatusDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
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
  comparisonContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  comparisonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
  },
  comparisonColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 8,
  },
  premiumColumn: {
    backgroundColor: '#FDF2F8',
    borderColor: '#FBCFE8',
    borderWidth: 2,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  premiumColumnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BE185D',
    marginBottom: 16,
    textAlign: 'center',
  },
  columnFeatures: {
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    color: '#374151',
  },
  featureTextDisabled: {
    color: '#9CA3AF',
  },
  featureDivider: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 12,
  },
  premiumFeatureDivider: {
    borderTopWidth: 1,
    borderTopColor: '#FBCFE8',
    paddingTop: 12,
    marginTop: 12,
  },
  pricingContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  pricingCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  popularBadgeContainer: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    zIndex: 1,
  },
  popularBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  planSavings: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  planPeriod: {
    color: '#6B7280',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  subscribeButton: {
    marginTop: 16,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    padding: 16,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  testimonialsContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  testimonialsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  testimonialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  testimonialAuthor: {
    color: '#4B5563',
    marginLeft: 8,
  },
  testimonialText: {
    color: '#374151',
  },
  faqContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  faqQuestion: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  faqAnswer: {
    color: '#4B5563',
  },
  bottomSpacing: {
    height: 80,
  },
});