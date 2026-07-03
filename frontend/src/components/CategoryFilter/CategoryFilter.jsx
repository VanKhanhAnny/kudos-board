import './CategoryFilter.css'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'recent', label: 'Recent' },
  { value: 'CELEBRATION', label: 'Celebration' },
  { value: 'THANK_YOU', label: 'Thank You' },
  { value: 'INSPIRATION', label: 'Inspiration' },
]

const MINE_TAB = { value: 'mine', label: 'My Boards' }

export function CategoryFilter({ selectedCategory, onSelectCategory, showMine = false }) {
  const tabs = showMine ? [...CATEGORIES, MINE_TAB] : CATEGORIES
  return (
    <div className="category-filter">
      {tabs.map((cat) => (
        <button
          key={cat.value}
          type="button"
          className={`category-filter__tab ${
            selectedCategory === cat.value ? 'is-active' : ''
          }`}
          onClick={() => onSelectCategory(cat.value)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
