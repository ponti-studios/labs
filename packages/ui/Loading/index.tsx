export default function LoadingScene() {
  return (
    <div role="status">
      <svg
        className="animate-spin w-12 h-12 text-indigo-400"
        viewBox="0 0 24 24"
      ></svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
