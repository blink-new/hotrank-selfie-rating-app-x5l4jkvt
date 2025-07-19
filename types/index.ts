export interface User {
  id: string
  email: string
  displayName?: string
  subscriptionStatus: 'free' | 'premium' | 'trial'
  referralCode: string
  referredBy?: string
  freeWeeksEarned: number
  city?: string
  createdAt: string
  updatedAt?: string
}

export interface Selfie {
  id: string
  userId: string
  imageUrl?: string
  videoUrl?: string
  type: 'photo' | 'live_pic'
  score: number
  rankPosition: number
  city: string
  isFiltered: number
  filterType?: string
  createdAt: string
}

export interface Filter {
  id: string
  name: string
  type: string
  isPremium: number
  createdAt: string
}

export interface Leaderboard {
  id: string
  userId: string
  selfieId: string
  city: string
  score: number
  rankPosition: number
  createdAt: string
}

export interface Referral {
  id: string
  referrerId: string
  referredUserId: string
  status: 'pending' | 'converted'
  createdAt: string
}

export interface InstagramShareData {
  imageUrl?: string
  videoUrl?: string
  score: number
  rank: number
  city: string
  type: 'photo' | 'live_pic'
}