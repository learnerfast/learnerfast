'use client';

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <iframe 
        src="https://unicorn.studio/embed/sEwpcxmgLVrSoilosopT" 
        style={{ width: '500px', height: '500px', border: 'none' }}
        title="Loading"
      />
    </div>
  );
}
