import React, { useState } from 'react';

export default function StarRating({ value, onChange, readonly = false, size = 28 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: size,
            cursor: readonly ? 'default' : 'pointer',
            color: (hovered || value) >= star ? '#ffa000' : '#ddd',
            transition: 'color 0.15s, transform 0.1s',
            transform: !readonly && hovered === star ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
          }}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function RatingDisplay({ value, showNumber = true, size = 16 }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: size + 4, lineHeight: 1 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            style={{ color: value >= s ? '#ffa000' : value >= s - 0.5 ? '#ffcc80' : '#ddd' }}
          >
            ★
          </span>
        ))}
      </span>
      {showNumber && (
        <span style={{ fontSize: size, fontWeight: 700, color: '#1a2540' }}>
          {value > 0 ? value.toFixed(1) : 'N/A'}
        </span>
      )}
    </span>
  );
}
