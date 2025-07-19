import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { Alert, Linking } from 'react-native'

export interface ShareToInstagramOptions {
  imageUrl?: string
  videoUrl?: string
  score: number
  rank: number
  city: string
  type: 'photo' | 'live_pic'
  isPremium: boolean
}

export const shareToInstagram = async (options: ShareToInstagramOptions) => {
  try {
    const { imageUrl, videoUrl, score, rank, city, type, isPremium } = options
    
    // Check if Instagram is available
    const instagramUrl = 'instagram://app'
    const canOpenInstagram = await Linking.canOpenURL(instagramUrl)
    
    if (!canOpenInstagram) {
      Alert.alert(
        'Instagram Not Found',
        'Please install Instagram to share your results.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open App Store', onPress: () => openAppStore() }
        ]
      )
      return false
    }

    // Create shareable content
    const shareableContent = await createInstagramContent(options)
    
    if (!shareableContent) {
      Alert.alert('Error', 'Failed to prepare content for sharing.')
      return false
    }

    // Share to Instagram
    await Sharing.shareAsync(shareableContent, {
      mimeType: type === 'live_pic' ? 'video/mp4' : 'image/jpeg',
      dialogTitle: 'Share to Instagram Stories'
    })

    return true
  } catch (error) {
    console.error('Error sharing to Instagram:', error)
    Alert.alert('Error', 'Failed to share to Instagram. Please try again.')
    return false
  }
}

const createInstagramContent = async (options: ShareToInstagramOptions): Promise<string | null> => {
  try {
    const { imageUrl, videoUrl, type } = options
    const sourceUrl = type === 'live_pic' ? videoUrl : imageUrl
    
    if (!sourceUrl) return null
    
    // Download the original content
    const fileExtension = type === 'live_pic' ? 'mp4' : 'jpg'
    const fileName = `hotpink_share_${Date.now()}.${fileExtension}`
    const localUri = `${FileSystem.documentDirectory}${fileName}`
    
    const downloadResult = await FileSystem.downloadAsync(sourceUrl, localUri)
    
    if (downloadResult.status === 200) {
      // For now, return the original content
      // In a production app, you would overlay branding, score, etc.
      return downloadResult.uri
    }
    
    return null
  } catch (error) {
    console.error('Error creating Instagram content:', error)
    return null
  }
}

const openAppStore = () => {
  const appStoreUrl = 'https://apps.apple.com/app/instagram/id389801252'
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.instagram.android'
  
  // Try to open appropriate store based on platform
  Linking.openURL(appStoreUrl).catch(() => {
    Linking.openURL(playStoreUrl)
  })
}

export const shareToInstagramStories = async (options: ShareToInstagramOptions) => {
  try {
    const { imageUrl, videoUrl, score, rank, city, type, isPremium } = options
    
    // Create Instagram Stories compatible content
    const storyContent = await createInstagramStoryContent(options)
    
    if (!storyContent) {
      Alert.alert('Error', 'Failed to prepare story content.')
      return false
    }

    // Open Instagram Stories directly
    const instagramStoriesUrl = `instagram-stories://share?source_application=hotpink`
    const canOpen = await Linking.canOpenURL(instagramStoriesUrl)
    
    if (canOpen) {
      await Linking.openURL(instagramStoriesUrl)
      return true
    } else {
      // Fallback to regular sharing
      return await shareToInstagram(options)
    }
  } catch (error) {
    console.error('Error sharing to Instagram Stories:', error)
    return false
  }
}

const createInstagramStoryContent = async (options: ShareToInstagramOptions): Promise<string | null> => {
  try {
    // This would create a story-optimized version with overlays
    // For now, use the same logic as regular sharing
    return await createInstagramContent(options)
  } catch (error) {
    console.error('Error creating Instagram story content:', error)
    return null
  }
}

export const generateShareText = (options: ShareToInstagramOptions): string => {
  const { score, rank, city, type, isPremium } = options
  
  const scoreText = isPremium ? `${score}/100` : '••/100'
  const rankText = isPremium ? `#${rank}` : '#••••'
  const mediaType = type === 'live_pic' ? 'Live Pic' : 'Selfie'
  
  return `Just got Pinked! 🔥\n${mediaType} Score: ${scoreText}\nRanking: ${rankText} in ${city}\n\nGet your AI hotness rating on HotPink! 📱✨\n\n#HotPink #AIRating #SelfieScore #GetPinked`
}

export const copyShareText = async (options: ShareToInstagramOptions) => {
  try {
    const shareText = generateShareText(options)
    // Note: Expo Clipboard would be used here in a real app
    // For now, just show the text to copy
    Alert.alert(
      'Copy Text',
      shareText,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', style: 'default' }
      ]
    )
    return true
  } catch (error) {
    console.error('Error copying share text:', error)
    return false
  }
}