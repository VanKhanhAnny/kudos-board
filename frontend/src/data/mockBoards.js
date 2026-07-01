import { heroImages } from './heroImages'

export const mockBoards = Array.from({ length: 540 }, (_, i) => ({
  id: `mock-${i}`,
  title: `Board ${i + 1}`,
  imageUrl: heroImages[Math.floor(Math.random() * heroImages.length)],
}))
