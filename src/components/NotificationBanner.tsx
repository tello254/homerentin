import { useState, useEffect } from 'react';

const NotificationBanner = () => {
  const [newListingsCount, setNewListingsCount] = useState(1);

  // Pick a random number between 1 and 4 — same for everyone on a given day,
  // refreshing once every 24 hours
  useEffect(() => {
    const randomize = () => {
      // Seed from the calendar day, so all users see the same number that day
      const now = new Date();
      const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      let hash = 0;
      for (let i = 0; i < dayKey.length; i++) {
        hash = dayKey.charCodeAt(i) + ((hash << 5) - hash);
      }
      setNewListingsCount((Math.abs(hash) % 4) + 1);
    };
    randomize();
    const interval = setInterval(randomize, 24 * 60 * 60 * 1000);
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
