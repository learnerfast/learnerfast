export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center z-50">
      <iframe 
        src="https://unicorn.studio/embed/sEwpcxmgLVrSoilosopT" 
        style={{ width: '500px', height: '500px', border: 'none' }}
        title="Loading"
      />
    </div>
  );
}
