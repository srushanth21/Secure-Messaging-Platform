export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full">
      <div className="w-20 h-20 mb-6 text-gray-300">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C12 2 4.5 4.5 4.5 9.5C4.5 15.5 12 22 12 22C12 22 19.5 15.5 19.5 9.5C19.5 4.5 12 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-signal-text-secondary font-medium">Select a chat to start messaging</p>
    </div>
  );
}
