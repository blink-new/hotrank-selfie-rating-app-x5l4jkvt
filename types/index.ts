export interface User {
  id: string
  email: string
  displayName?: string
  subscriptionStatus: 'free' | 'premium' | 'trial'
  referralCode: string
  referredBy?: string
  freeWeeksEarned: number
  createdAt: string
}

export interface Selfie {
  id: string
  userId: string
  imageUrl: string
  score: number
  rank: number
  city: string
  createdAt: string
}

export interface Referral {
  id: string
  referrerId: string
  referredUserId: string
  status: 'pending' | 'converted'
  createdAt: string
}