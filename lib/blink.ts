import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'hotrank-selfie-rating-app-x5l4jkvt',
  authRequired: true // Enable authentication for full app functionality
})

export default blink