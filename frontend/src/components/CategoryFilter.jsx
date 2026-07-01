import './CategoryFilter.css'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'recent', label: 'Recent' },
  { value: 'CELEBRATION', label: 'Celebration' },
  { value: 'THANK_YOU', label: 'Thank You' },
  { value: 'INSPIRATION', label: 'Inspiration' },
]

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="category-filter">
      {CATEGORIES.map((cat) => (
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
