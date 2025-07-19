// Mock AI scoring system for HotRank
export function generateHotnessScore(): number {
  // Generate scores between 60-100 with realistic distribution
  // Most scores fall between 70-85, with fewer extreme scores
  const random = Math.random()
  
  if (random < 0.05) {
    // 5% chance of exceptional score (95-100)
    return Math.floor(Math.random() * 6) + 95
  } else if (random < 0.15) {
    // 10% chance of very high score (90-94)
    return Math.floor(Math.random() * 5) + 90
  } else if (random < 0.25) {
    // 10% chance of low score (60-69)
    return Math.floor(Math.random() * 10) + 60
  } else {
    // 75% chance of normal score (70-89)
    return Math.floor(Math.random() * 20) + 70
  }
}

export function generateCityRank(score: number): number {
  // Generate rank based on score with some randomness
  let baseRank: number
  
  if (score >= 95) {
    baseRank = Math.floor(Math.random() * 50) + 1 // Top 50
  } else if (score >= 90) {
    baseRank = Math.floor(Math.random() * 200) + 50 // Top 250
  } else if (score >= 85) {
    baseRank = Math.floor(Math.random() * 500) + 250 // Top 750
  } else if (score >= 75) {
    baseRank = Math.floor(Math.random() * 2000) + 750 // Top 2750
  } else {
    baseRank = Math.floor(Math.random() * 7000) + 2750 // Below top 2750
  }
  
  return Math.max(1, baseRank)
}

export function getScoreDescription(score: number): string {
  if (score >= 95) return "Absolutely stunning! 🔥"
  if (score >= 90) return "Incredibly hot! 😍"
  if (score >= 85) return "Very attractive! ✨"
  if (score >= 80) return "Looking great! 😊"
  if (score >= 75) return "Pretty good! 👍"
  if (score >= 70) return "Not bad! 😌"
  return "Room for improvement! 💪"
}

export function getRankDescription(rank: number): string {
  if (rank <= 100) return "Top 1% in your city! 🏆"
  if (rank <= 500) return "Top 5% in your city! 🥇"
  if (rank <= 1000) return "Top 10% in your city! 🎯"
  if (rank <= 2500) return "Top 25% in your city! ⭐"
  if (rank <= 5000) return "Top 50% in your city! 👌"
  return "Keep improving! 💪"
}

export function generateInsights(score: number): string[] {
  const positiveInsights = [
    "Great lighting in this photo!",
    "Your smile really lights up the frame",
    "Excellent photo composition",
    "Natural pose looks fantastic",
    "Perfect angle for your features",
    "Your confidence really shows",
    "Great use of natural lighting",
    "Your style is on point",
    "Authentic expression captured well",
    "Good contrast and clarity",
    "Your eyes are very expressive",
    "Nice background choice",
    "Great photo timing",
    "Your personality shines through",
    "Excellent selfie technique"
  ]
  
  const improvements = [
    "Try taking photos during golden hour",
    "Consider a slight angle adjustment",
    "Natural lighting could enhance this",
    "A genuine smile adds warmth",
    "Try positioning the camera slightly higher",
    "Experiment with different backgrounds",
    "Good posture can boost your score",
    "Eye contact with camera creates connection",
    "Soft, even lighting works best",
    "Relax your shoulders for a natural look"
  ]
  
  const insights: string[] = []
  
  if (score >= 90) {
    // High scores get mostly positive insights
    insights.push(...getRandomItems(positiveInsights, 2))
    insights.push("You're in the top tier! 🔥")
  } else if (score >= 80) {
    // Good scores get mix of positive and tips
    insights.push(...getRandomItems(positiveInsights, 1))
    insights.push(...getRandomItems(improvements, 1))
    insights.push("You're looking great! 😊")
  } else {
    // Lower scores get more improvement tips
    insights.push(...getRandomItems(improvements, 2))
    insights.push("Keep practicing - you've got this! 💪")
  }
  
  return insights
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function generateMockAnalysis(score: number) {
  return {
    score,
    rank: generateCityRank(score),
    description: getScoreDescription(score),
    rankDescription: getRankDescription(generateCityRank(score)),
    insights: generateInsights(score),
    breakdown: {
      lighting: Math.floor(Math.random() * 20) + 80,
      composition: Math.floor(Math.random() * 20) + 75,
      expression: Math.floor(Math.random() * 25) + 70,
      style: Math.floor(Math.random() * 30) + 65
    }
  }
}