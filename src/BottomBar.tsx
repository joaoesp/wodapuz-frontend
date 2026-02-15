import "./BottomBar.css";

const categories = [
  { name: "Economy", initial: "E" },
  { name: "Trade", initial: "T" },
  { name: "Military", initial: "M" },
  { name: "Energy", initial: "E" },
  { name: "Resources", initial: "R" },
  { name: "Demographics", initial: "D" },
];

interface BottomBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

function BottomBar({ selectedCategory, onSelectCategory }: BottomBarProps) {
  return (
    <div className="bottom-bar">
      {categories.map((cat) => (
        <button
          key={cat.name}
          className={`bottom-bar-btn ${selectedCategory === cat.name ? "active" : ""}`}
          title={cat.name}
          onClick={() => onSelectCategory(cat.name)}
        >
          {cat.initial}
        </button>
      ))}
    </div>
  );
}

export default BottomBar;
