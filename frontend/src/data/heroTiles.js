import { heroImages } from './heroImages'

export const heroTiles = Array.from({ length: 540 }, (_, i) => ({
  id: `tile-${i}`,
  imageUrl: heroImages[Math.floor(Math.random() * heroImages.length)],
}))
