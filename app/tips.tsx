import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Tip {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export default function TipsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Tips', icon: 'bulb' },
    { key: 'lighting', label: 'Lighting', icon: 'sunny' },
    { key: 'angles', label: 'Angles', icon: 'camera' },
    { key: 'expression', label: 'Expression', icon: 'happy' },
    { key: 'background', label: 'Background', icon: 'image' }
  ];

  const tips: Tip[] = [
    {
      id: '1',
      category: 'lighting',
      title: 'Natural Light is Your Friend',
      description: 'Take selfies near a window during golden hour (1 hour before sunset) for the most flattering natural lighting.',
      icon: 'sunny-outline',
      difficulty: 'Easy'
    },
    {
      id: '2',
      category: 'angles',
      title: 'Find Your Best Angle',
      description: 'Hold your phone slightly above eye level and angle it down. This creates a more flattering perspective.',
      icon: 'camera-outline',
      difficulty: 'Easy'
    },
    {
      id: '3',
      category: 'expression',
      title: 'Genuine Smile',
      description: 'Think of something that makes you genuinely happy before taking the photo. Authentic expressions score higher.',
      icon: 'happy-outline',
      difficulty: 'Easy'
    },
    {
      id: '4',
      category: 'lighting',
      title: 'Avoid Harsh Shadows',
      description: 'Avoid direct overhead lighting or harsh sunlight. Soft, diffused light creates more even skin tones.',
      icon: 'contrast-outline',
      difficulty: 'Medium'
    },
    {
      id: '5',
      category: 'background',
      title: 'Clean Background',
      description: 'Choose a simple, uncluttered background that doesn\'t distract from your face.',
      icon: 'image-outline',
      difficulty: 'Easy'
    },
    {
      id: '6',
      category: 'angles',
      title: 'The 2/3 Rule',
      description: 'Position your face to take up about 2/3 of the frame. This creates better composition and focus.',
      icon: 'crop-outline',
      difficulty: 'Medium'
    },
    {
      id: '7',
      category: 'expression',
      title: 'Eye Contact',
      description: 'Look directly into the camera lens, not at your screen. This creates better connection and engagement.',
      icon: 'eye-outline',
      difficulty: 'Easy'
    },
    {
      id: '8',
      category: 'lighting',
      title: 'Ring Light Setup',
      description: 'If using artificial lighting, position a ring light at eye level for even, professional-looking illumination.',
      icon: 'radio-button-on-outline',
      difficulty: 'Advanced'
    },
    {
      id: '9',
      category: 'angles',
      title: 'Chin Forward Technique',
      description: 'Slightly push your chin forward and down to define your jawline and reduce double chin appearance.',
      icon: 'arrow-forward-outline',
      difficulty: 'Medium'
    },
    {
      id: '10',
      category: 'background',
      title: 'Color Coordination',
      description: 'Wear colors that complement your skin tone and contrast nicely with your background.',
      icon: 'color-palette-outline',
      difficulty: 'Medium'
    },
    {
      id: '11',
      category: 'expression',
      title: 'Relaxed Posture',
      description: 'Keep your shoulders relaxed and slightly back. Tension shows in photos and affects your overall appearance.',
      icon: 'body-outline',
      difficulty: 'Medium'
    },
    {
      id: '12',
      category: 'lighting',
      title: 'Avoid Mixed Lighting',
      description: 'Don\'t mix different light sources (natural + artificial). Stick to one type for consistent color temperature.',
      icon: 'bulb-outline',
      difficulty: 'Advanced'
    }
  ];

  const getFilteredTips = () => {
    if (selectedCategory === 'all') return tips;
    return tips.filter(tip => tip.category === selectedCategory);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTips = getFilteredTips();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">Selfie Tips</Text>
        <View className="w-6" />
      </View>

      {/* Hero Section */}
      <View className="px-6 py-8 bg-gradient-to-br from-pink-50 to-blue-50">
        <View className="items-center">
          <View className="w-20 h-20 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full items-center justify-center mb-4">
            <Ionicons name="bulb" size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
            Boost Your Score
          </Text>
          <Text className="text-gray-600 text-center">
            Learn pro tips to take better selfies and improve your hotness rating
          </Text>
        </View>
      </View>

      {/* Category Filter */}
      <View className="px-6 py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  selectedCategory === category.key
                    ? 'bg-pink-500 border-pink-500'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedCategory === category.key ? 'white' : '#6B7280'} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedCategory === category.key
                    ? 'text-white'
                    : 'text-gray-700'
                }`}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Tips List */}
      <ScrollView className="flex-1 px-6 pb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'All Tips' : categories.find(c => c.key === selectedCategory)?.label} 
          ({filteredTips.length})
        </Text>
        
        <View className="space-y-4">
          {filteredTips.map((tip, index) => (
            <View
              key={tip.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              {/* Header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-gradient-to-br from-pink-100 to-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name={tip.icon as any} size={20} color="#FF1B6B" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900 flex-1">
                    {tip.title}
                  </Text>
                </View>
                
                <View className={`px-2 py-1 rounded-full ${getDifficultyColor(tip.difficulty)}`}>
                  <Text className="text-xs font-semibold">
                    {tip.difficulty}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text className="text-gray-700 leading-relaxed">
                {tip.description}
              </Text>

              {/* Category Badge */}
              <View className="flex-row items-center mt-4">
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-gray-600 capitalize">
                    {tip.category}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Call to Action */}
        <View className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-6 mt-6">
          <View className="items-center">
            <Ionicons name="camera" size={32} color="#FF1B6B" />
            <Text className="text-lg font-semibold text-gray-900 mt-3 mb-2">
              Ready to Try These Tips?
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              Put your new knowledge to the test and see how much your score improves!
            </Text>
            <TouchableOpacity 
              className="bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl px-8 py-3"
              onPress={() => router.push('/camera')}
            >
              <Text className="text-white font-semibold text-lg">
                Take New Selfie
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pro Tip */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-4">
          <View className="flex-row items-start">
            <Ionicons name="star" size={24} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-yellow-800 mb-2">
                Pro Tip: Practice Makes Perfect
              </Text>
              <Text className="text-yellow-700 text-sm leading-relaxed">
                The best way to improve your selfie game is to practice these techniques regularly. 
                Try different combinations and see what works best for your unique features!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}