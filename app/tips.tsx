import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { ArrowLeft, Lightbulb, Camera, Smile, Image, Star } from 'lucide-react-native'

const { width } = Dimensions.get('window')

interface Tip {
  id: string
  category: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Advanced'
}

export default function TipsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { key: 'all', label: 'All Tips', icon: <Lightbulb size={16} color="#6B7280" /> },
    { key: 'lighting', label: 'Lighting', icon: <Lightbulb size={16} color="#6B7280" /> },
    { key: 'angles', label: 'Angles', icon: <Camera size={16} color="#6B7280" /> },
    { key: 'expression', label: 'Expression', icon: <Smile size={16} color="#6B7280" /> },
    { key: 'background', label: 'Background', icon: <Image size={16} color="#6B7280" /> }
  ]

  const tips: Tip[] = [
    {
      id: '1',
      category: 'lighting',
      title: 'Natural Light is Your Friend',
      description: 'Take selfies near a window during golden hour (1 hour before sunset) for the most flattering natural lighting.',
      icon: <Lightbulb size={20} color="#FF1B6B" />,
      difficulty: 'Easy'
    },
    {
      id: '2',
      category: 'angles',
      title: 'Find Your Best Angle',
      description: 'Hold your phone slightly above eye level and angle it down. This creates a more flattering perspective.',
      icon: <Camera size={20} color="#FF1B6B" />,
      difficulty: 'Easy'
    },
    {
      id: '3',
      category: 'expression',
      title: 'Genuine Smile',
      description: 'Think of something that makes you genuinely happy before taking the photo. Authentic expressions score higher.',
      icon: <Smile size={20} color="#FF1B6B" />,
      difficulty: 'Easy'
    },
    {
      id: '4',
      category: 'lighting',
      title: 'Avoid Harsh Shadows',
      description: 'Avoid direct overhead lighting or harsh sunlight. Soft, diffused light creates more even skin tones.',
      icon: <Lightbulb size={20} color="#FF1B6B" />,
      difficulty: 'Medium'
    },
    {
      id: '5',
      category: 'background',
      title: 'Clean Background',
      description: 'Choose a simple, uncluttered background that doesn\'t distract from your face.',
      icon: <Image size={20} color="#FF1B6B" />,
      difficulty: 'Easy'
    },
    {
      id: '6',
      category: 'angles',
      title: 'The 2/3 Rule',
      description: 'Position your face to take up about 2/3 of the frame. This creates better composition and focus.',
      icon: <Camera size={20} color="#FF1B6B" />,
      difficulty: 'Medium'
    },
    {
      id: '7',
      category: 'expression',
      title: 'Eye Contact',
      description: 'Look directly into the camera lens, not at your screen. This creates better connection and engagement.',
      icon: <Smile size={20} color="#FF1B6B" />,
      difficulty: 'Easy'
    },
    {
      id: '8',
      category: 'lighting',
      title: 'Ring Light Setup',
      description: 'If using artificial lighting, position a ring light at eye level for even, professional-looking illumination.',
      icon: <Lightbulb size={20} color="#FF1B6B" />,
      difficulty: 'Advanced'
    },
    {
      id: '9',
      category: 'angles',
      title: 'Chin Forward Technique',
      description: 'Slightly push your chin forward and down to define your jawline and reduce double chin appearance.',
      icon: <Camera size={20} color="#FF1B6B" />,
      difficulty: 'Medium'
    },
    {
      id: '10',
      category: 'background',
      title: 'Color Coordination',
      description: 'Wear colors that complement your skin tone and contrast nicely with your background.',
      icon: <Image size={20} color="#FF1B6B" />,
      difficulty: 'Medium'
    },
    {
      id: '11',
      category: 'expression',
      title: 'Relaxed Posture',
      description: 'Keep your shoulders relaxed and slightly back. Tension shows in photos and affects your overall appearance.',
      icon: <Smile size={20} color="#FF1B6B" />,
      difficulty: 'Medium'
    },
    {
      id: '12',
      category: 'lighting',
      title: 'Avoid Mixed Lighting',
      description: 'Don\'t mix different light sources (natural + artificial). Stick to one type for consistent color temperature.',
      icon: <Lightbulb size={20} color="#FF1B6B" />,
      difficulty: 'Advanced'
    }
  ]

  const getFilteredTips = () => {
    if (selectedCategory === 'all') return tips
    return tips.filter(tip => tip.category === selectedCategory)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return { text: '#059669', bg: '#D1FAE5' }
      case 'Medium': return { text: '#D97706', bg: '#FED7AA' }
      case 'Advanced': return { text: '#DC2626', bg: '#FEE2E2' }
      default: return { text: '#6B7280', bg: '#F3F4F6' }
    }
  }

  const filteredTips = getFilteredTips()

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
        <Text style={styles.headerTitle}>Selfie Tips</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroIcon}>
                <Lightbulb size={40} color="white" />
              </View>
              <Text style={styles.heroTitle}>Boost Your Score</Text>
              <Text style={styles.heroSubtitle}>
                Learn pro tips to take better selfies and improve your hotness rating
              </Text>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.key && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  {React.cloneElement(category.icon, {
                    color: selectedCategory === category.key ? 'white' : '#6B7280'
                  })}
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.key && styles.categoryTextActive
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tips List */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Tips' : categories.find(c => c.key === selectedCategory)?.label} 
            ({filteredTips.length})
          </Text>
          
          {filteredTips.map((tip, index) => {
            const difficultyColors = getDifficultyColor(tip.difficulty)
            return (
              <View key={tip.id} style={styles.tipCard}>
                {/* Header */}
                <View style={styles.tipHeader}>
                  <View style={styles.tipTitleContainer}>
                    <View style={styles.tipIcon}>
                      {tip.icon}
                    </View>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                  </View>
                  
                  <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors.bg }]}>
                    <Text style={[styles.difficultyText, { color: difficultyColors.text }]}>
                      {tip.difficulty}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.tipDescription}>{tip.description}</Text>

                {/* Category Badge */}
                <View style={styles.categoryBadgeContainer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{tip.category}</Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <View style={styles.ctaContent}>
              <Camera size={32} color="#FF1B6B" />
              <Text style={styles.ctaTitle}>Ready to Try These Tips?</Text>
              <Text style={styles.ctaSubtitle}>
                Put your new knowledge to the test and see how much your score improves!
              </Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => router.push('/camera')}
              >
                <LinearGradient
                  colors={['#FF1B6B', '#45CAFF']}
                  style={styles.ctaButtonGradient}
                >
                  <Text style={styles.ctaButtonText}>Take New Selfie</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pro Tip */}
        <View style={styles.proTipSection}>
          <View style={styles.proTipCard}>
            <View style={styles.proTipContent}>
              <Star size={24} color="#F59E0B" />
              <View style={styles.proTipText}>
                <Text style={styles.proTipTitle}>Pro Tip: Practice Makes Perfect</Text>
                <Text style={styles.proTipDescription}>
                  The best way to improve your selfie game is to practice these techniques regularly. 
                  Try different combinations and see what works best for your unique features!
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 32,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  categorySection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'white',
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#374151',
  },
  categoryTextActive: {
    color: 'white',
  },
  tipsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,27,107,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  categoryBadgeContainer: {
    flexDirection: 'row',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  ctaSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  ctaCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  proTipSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  proTipCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  proTipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  proTipText: {
    flex: 1,
    marginLeft: 12,
  },
  proTipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  proTipDescription: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 80,
  },
})