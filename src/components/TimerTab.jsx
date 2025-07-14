import { Button } from "@headlessui/react";

export default function TimerTab({
  isRunning,
  setCurrentTime,
  getCurrentTime,
  activeTab,
  startTimer,
  stopTimer,
  timeLeft,
  setTimeLeft,
  resetTimer,
  isStarted,
}) {
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60); //dakika değeri
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}.${sec
      .toString()
      .padStart(2, "0")}`;
  };
  return (
    <div>
      <div className="flex gap-2 text-4xl w-fit p-1 m-1 data-hover:border-gray-600">
        <div
          key={activeTab}
          suppressContentEditableWarning={true}
          onBlur={(e) => {
            const val = e.currentTarget.textContent;
            const numVal = val.split(".");
            const minutes = parseInt(numVal[0].replace(/\D/g, ""), 10);
            if (!isNaN(minutes)) {
              setCurrentTime(minutes);
              setTimeLeft(null);
            }
          }}
          contentEditable={!isStarted}
        >
          {isStarted && timeLeft !== null
            ? formatTime(timeLeft)
            : formatTime(getCurrentTime() * 60)}
        </div>
      </div>
      {
        <>
          <Button
            onClick={isRunning ? stopTimer : startTimer}
            className="inline-flex ml-1 items-center mb-1 gap-2 rounded-md border-1 border-gray-600 p-1  cursor-pointer"
          >
            {!isRunning ? `Start` : `Stop`}
          </Button>
          {/* aşağıdaki, reset butonu */}
          <Button
            onClick={resetTimer}
            className="inline-flex items-center mb-1 ml-3 gap-2 rounded-full p-2 border-1 border-gray-600 cursor-pointer data-[hover]:bg-gray-700"
          >
            {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-4"
              >
                <rect width={10} height={10} x={3} y={3} rx={1.5} />
              </svg>
            }
          </Button>
        </>
      }
    </div>
  );
}
