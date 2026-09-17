import React from 'react';

interface AvatarProps {
  name?: string | null;
  handle?: string | null;
  avatarUrl?: string | null;
  size?: number;
}

const colors = [
  '#FF3366', '#FF9933', '#FFCC00', '#33CC66', 
  '#3399FF', '#9933FF', '#FF33CC', '#33CCFF'
];

export function Avatar({ name, handle, avatarUrl, size = 40 }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={name || handle || 'Avatar'} 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          objectFit: 'cover',
          border: '2px solid rgba(255,255,255,0.1)'
        }} 
      />
    );
  }

  // Si no hay nombre ni handle, generar uno genérico
  if (!name && !handle) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontWeight: 'bold',
        fontSize: size * 0.4,
        border: '2px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        ⚽
      </div>
    );
  }

  const seed = (name || handle || 'A').toUpperCase();
  const initials = seed.substring(0, 2);
  
  // Simple hash for deterministic color
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const color = colors[colorIndex];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: size * 0.4,
      border: '2px solid rgba(255,255,255,0.1)',
      flexShrink: 0
    }}>
      {initials}
    </div>
  );
}
