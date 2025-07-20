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
  completedSessions,
  totalCycles,
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
      {/* kaç sessionumuz daha kaldığını bize söyleyen label */}
      <div className="text-sm m-2 mb-1 select-none transition duration-300">
        {completedSessions >= totalCycles
          ? "🎉 All sessions completed!"
          : `Completed ${completedSessions} of ${totalCycles} sessions`}
      </div>
      <div className="flex gap-2 text-4xl w-fit m-1 data-hover:bg-gray-600 transition duration-300">
        <div
          className={
            isStarted
              ? "p-1"
              : "hover:bg-gray-900 transition duration-300 rounded-xl p-1"
          }
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
            className="ml-1 mb-1  rounded-full border-1 border-gray-600 p-1 w-16  cursor-pointer data-[hover]:bg-gray-700 transition duration-300"
          >
            {!isRunning ? `Start` : `Stop`}
          </Button>
          {/* aşağıdaki, reset butonu */}
          <Button
            onClick={resetTimer}
            className="inline-flex justify-center mb-1 ml-3 gap-2 rounded-full w-9 align-middle p-1.5 border-1 border-gray-600 cursor-pointer data-[hover]:bg-gray-700 transition duration-300"
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
