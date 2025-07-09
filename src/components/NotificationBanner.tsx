import { useState, useEffect } from 'react';

const NotificationBanner = () => {
  const [newListingsCount, setNewListingsCount] = useState(1);

  // Deterministically generate a number between 1-6 based on the current date (same for all clients)
  useEffect(() => {
    const getDaySeed = () => {
      const now = new Date();
      // Use year and day of year as seed
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      return `${now.getFullYear()}-${dayOfYear}`;
    };

    // Simple deterministic hash to get a number between 1-6
    const getDeterministicCount = () => {
      const seed = getDaySeed();
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }
      // Map hash to 1-6
      return (Math.abs(hash) % 6) + 1;
    };

    setNewListingsCount(getDeterministicCount());

    // Set a timer to update at the next midnight
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime() - now.getTime();
    const timeout = setTimeout(() => {
      setNewListingsCount(getDeterministicCount());
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  const message = `New Listings Alert<span style="color: black;">‼️</span> ${newListingsCount} fresh homes just hit the market today. Go check them out before they're gone! Happy stays!`;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 text-sm font-medium overflow-hidden whitespace-nowrap">
      <div className="animate-marquee">
        <span dangerouslySetInnerHTML={{ __html: message }} />
        <span style={{ marginLeft: '5cm' }}></span>
        <span dangerouslySetInnerHTML={{ __html: message }} />
        <span style={{ marginLeft: '5cm' }}></span>
      </div>
    </div>
  );
};

export default NotificationBanner;
