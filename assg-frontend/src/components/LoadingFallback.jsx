function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}


export default LoadingFallback; 