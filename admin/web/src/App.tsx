import React from 'react';

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>Admin Dashboard</h1>
      <p>Vite + React scaffold is running.</p>
      <p>API base: {import.meta.env.VITE_API_BASE_URL}</p>
    </div>
  );
}