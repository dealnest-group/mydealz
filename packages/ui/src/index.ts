import React from 'react'

export const Button: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({
  children,
  onClick,
}) => {
  return (
    <button onClick={onClick} style={{ padding: '8px 16px', border: '1px solid #ccc' }}>
      {children}
    </button>
  )
}