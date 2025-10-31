export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <iframe 
        src="https://unicorn.studio/embed/sEwpcxmgLVrSoilosopT" 
        style={{ width: '400px', height: '400px', border: 'none' }}
        title="Loading"
      />
    </div>
  );
}
