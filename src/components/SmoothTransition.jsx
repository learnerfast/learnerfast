'use client';
import { useEffect, useState } from 'react';

export default function SmoothTransition({ children, delay = 0 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className="transition-opacity duration-300"
      style={{ opacity: show ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
