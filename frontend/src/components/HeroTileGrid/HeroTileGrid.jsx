import { HeroTile } from '../HeroTile'
import './HeroTileGrid.css'

export function HeroTileGrid({ tiles }) {
  return (
    <div className="hero-tile-grid">
      {tiles.map((tile) => (
        <HeroTile key={tile.id} tile={tile} />
      ))}
    </div>
  )
}
