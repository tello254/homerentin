import { useState, useEffect } from 'react';

const NotificationBanner = () => {
  const [newListingsCount, setNewListingsCount] = useState(1);

  // Generate random number between 1-6 and update every 24 hours
  useEffect(() => {
    const generateRandomCount = () => {
      return Math.floor(Math.random() * 6) + 1; // Random number between 1-6
    };

    // Set initial count
    setNewListingsCount(generateRandomCount());

    // Update count every 24 hours (24 * 60 * 60 * 1000 milliseconds)
    const interval = setInterval(() => {
      setNewListingsCount(generateRandomCount());
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
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
