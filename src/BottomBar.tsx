import "./BottomBar.css";

const categories = [
  { name: "Economy", initial: "E" },
  { name: "Trade", initial: "T" },
  { name: "Military", initial: "M" },
  { name: "Energy", initial: "E" },
  { name: "Resources", initial: "R" },
  { name: "Demographics", initial: "D" },
];

function BottomBar() {
  return (
    <div className="bottom-bar">
      {categories.map((cat) => (
        <button key={cat.name} className="bottom-bar-btn" title={cat.name}>
          {cat.initial}
        </button>
      ))}
    </div>
  );
}

export default BottomBar;
