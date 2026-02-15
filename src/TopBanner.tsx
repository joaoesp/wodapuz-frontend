import "./TopBanner.css";

interface TopBannerProps {
  selectedCategory: string;
}

function TopBanner({ selectedCategory }: TopBannerProps) {
  return <div className="top-banner">{selectedCategory}</div>;
}

export default TopBanner;
