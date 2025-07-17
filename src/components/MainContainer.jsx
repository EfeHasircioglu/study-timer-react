import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Description,
  Field,
  Label,
  Select,
  Input,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

import TimerTab from "./TimerTab";

export default function MainContainer() {
  //üç ayrı (mod) için ayrı stateler, çünkü her birinin süresini biz değiştirebiliyoruz
  const [enabled, setEnabled] = useState(true);
  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null); // zamanlayıcı başlayana kadar hiçbirşey gösterilmediği için null, saniye cinsinden süreyi temsil ediyor
  const [intervalID, setIntervalID] = useState(null); //zamanlayıcının hangi zamanlayıcı olduğunu bilmek ve onu başlatıp durdurabilmek için
  const [isStarted, setIsStarted] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0); // kaç tane çalışma sessionu tamamladığımızı tutar
  const [longBreakInterval, setLongBreakInterval] = useState(2); //kaç sessionda bir long break'a geçilecek?
  const [longBreakInput, setLongBreakInput] = useState("2"); //inputu alıp geçici olarak buraya koyacağız
  const [longBreakError, setLongBreakError] = useState("");
  const [sessionAmountError, setSessionAmountError] = useState("");
  const [error, setError] = useState("");
  const [totalCycles, setTotalCycles] = useState(4); //kaç session sonra çalışma tamamlanacak?
  //bu fonksiyon ile hangi tabdaysak onun süresini oraya koymamızı sağlıyor.
  const getCurrentTime = () => {
    if (activeTab === 0) return studyTime;
    if (activeTab === 1) return breakTime;
    if (activeTab === 2) return longBreakTime;
  };
  //kullanıcı divin içerisindeki değeri değiştirirse hangi tabda olduğuna göre onun değeri değişecek
  const setCurrentTime = (newTime) => {
    if (activeTab === 0) setStudyTime(newTime);
    else if (activeTab === 1) setBreakTime(newTime);
    else if (activeTab === 2) setLongBreakTime(newTime);
  };

  //reset butonu için fonksiyon
  const resetTimer = () => {
    setIntervalID(null);
    setIsRunning(false);
    setIsStarted(false);
    setTimeLeft(null); //zamanı da sıfırlıyoruz
    setCompletedSessions(0);
    setActiveTab(0); //bu olmayadabilir
  };

  // timer'i başlatmak için.
  const startTimer = () => {
    if (!isStarted) {
      // eğer ilk defa başlatılıyorsa
      const studySec = studyTime * 60;
      setTimeLeft(studySec);
      setIsStarted(true);
    }
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return; //timer çalışmıyorsa zaten yapacak bir şey yok.
    if (timeLeft === 0) {
      setIsRunning(false);
      handleNextPhase();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextPhase();
          return 0;
        }
        return prev - 1; //saniye azaltma mantığı, her saniye olacak
      });
    }, 1000 /* her saniye olması için */);

    return () => clearInterval(interval);
  }, [isRunning, activeTab, timeLeft]);
  //sessionlar arası geçişleri ayarlamak için bir fonksiyon
  const handleNextPhase = () => {
    if (activeTab === 0) {
      setTimeLeft(studyTime);

      const nextSessionCount = completedSessions + 1;
      if (nextSessionCount >= totalCycles) {
        // toplam cycle hedefine ulaşıldıysa her şeyi durdur ve bitir!
        setIsRunning(false);
        setIsStarted(false);
        setActiveTab(0);
        setTimeLeft(null);
        return;
        //TODO: buraya daha sonra başka şeyler de yazılabilir tamamlama ile ilgili, tebrik ve ses, clap clap sesi koyulabilir
      }

      setCompletedSessions(nextSessionCount); //tamamlanan session sayısını arttırıyoruz eğer bitmemiş ise

      if (nextSessionCount % longBreakInterval === 0) {
        setActiveTab(2);
        setTimeLeft(longBreakTime * 60);
      } else {
        setActiveTab(1);
        setTimeLeft(breakTime * 60);
      }
    } //eğer breakta isek bu sefer
    else {
      setActiveTab(0);
      setTimeLeft(studyTime * 60);
    }
    setIsRunning(true); //geçişlerde otomatik olarak başlasın
  };
  //timer durdurmak için
  const stopTimer = () => {
    setIsRunning(false); //sadece isRunning'i durduruyoruz, useEffect var zaten
  };

  const tabNames = ["Study", "Break", "Long Break"];
  return (
    <div>
      <TabGroup
        selectedIndex={activeTab}
        onChange={setActiveTab}
        className={"w-fit"}
      >
        <TabList className="tabs-container">
          {tabNames.map((name, index) => (
            <Tab
              key={index}
              disabled={isStarted && activeTab !== index}
              className="rounded-full px-3 py-1 text-md/6 cursor-pointer text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10"
            >
              {name}
            </Tab>
          ))}
        </TabList>
        <TabPanels className={"tabs-container"}>
          <TabPanel
            className={
              "border-1 bg-gray-800 border-gray-700 backdrop-blur-xl rounded-xl"
            }
          >
            <TimerTab
              getCurrentTime={getCurrentTime}
              setCurrentTime={setCurrentTime}
              isRunning={isRunning}
              startTimer={startTimer}
              stopTimer={stopTimer}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              resetTimer={resetTimer}
              isStarted={isStarted}
              completedSessions={completedSessions}
              totalCycles={totalCycles}
            ></TimerTab>
          </TabPanel>
          <TabPanel
            className={
              "border-1 bg-gray-800 border-gray-700 backdrop-blur-xl rounded-xl"
            }
          >
            <TimerTab
              getCurrentTime={getCurrentTime}
              setCurrentTime={setCurrentTime}
              isRunning={isRunning}
              startTimer={startTimer}
              stopTimer={stopTimer}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              resetTimer={resetTimer}
              isStarted={isStarted}
              completedSessions={completedSessions}
              totalCycles={totalCycles}
            ></TimerTab>
          </TabPanel>
          <TabPanel
            className={
              "border-1 bg-gray-800 border-gray-700 backdrop-blur-xl rounded-xl"
            }
          >
            <TimerTab
              getCurrentTime={getCurrentTime}
              setCurrentTime={setCurrentTime}
              isRunning={isRunning}
              startTimer={startTimer}
              stopTimer={stopTimer}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              resetTimer={resetTimer}
              isStarted={isStarted}
              completedSessions={completedSessions}
              totalCycles={totalCycles}
            ></TimerTab>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <Disclosure as="div" className="pt-6">
        <DisclosureButton className="border-1 p-2 mt-0 m-2 bg-gray-900 border-gray-700 rounded-full group flex items-center justify-between cursor-pointer ">
          <span className="flex pl-1.5 gap-3 items-center text-sm/6 font-medium text-white ">
            Settings{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 ml-auto"
            >
              <path
                fillRule="evenodd"
                d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </DisclosureButton>
        <DisclosurePanel className="mt-2 max-w-2xs text-sm/5 text-white/50">
          <div className="flex flex-col">
            <div className="m-1 mb-0 text-sm">Long Break Interval Amount</div>
            <Input
              disabled={isStarted}
              className="px-3 py-1.5 mt-1 w-full rounded-lg text-sm/6 bg-white/5 text-white border border-gray-900 data-[disabled]:text-white/50"
              name="lb_interval_amount"
              min={2}
              itemID="lb_interval_amount"
              max={12}
              value={longBreakInput}
              onChange={(e) => setLongBreakInput(e.target.value)}
              onBlur={() => {
                const parsed = parseInt(longBreakInput, 10);
                if (isNaN(parsed) || 12 < parsed || parsed < 2) {
                  setLongBreakError("Invalid number of intervals");
                  setLongBreakInput(longBreakInterval.toString()); //eğer interval geçersiz ise eski değere geri dönülüyor
                } else {
                  setLongBreakInput(parsed);
                  setLongBreakInterval(parsed);
                  setLongBreakError(""); // hata yoksa uyarıyı sil
                }
              }}
              type="number"
            />
            <label
              className="text-xs text-red-500 p-1 pb-0"
              htmlFor="interval_amount"
            >
              {longBreakError}
            </label>
          </div>
          <div className="flex flex-col">
            <div className="m-1">Total Study Sessions</div>
            <Input
              disabled={isStarted}
              className="px-3 py-1.5 mt-1 w-full rounded-lg text-sm/6 bg-white/5 text-white border border-gray-900 data-[disabled]:text-white/50"
              name="interval_amount"
              min={longBreakInterval} //en az 1 long break olacak kadar olmalı
              itemID="interval_amount"
              max={36}
              value={totalCycles}
              onChange={(e) => setTotalCycles(e.target.value)}
              onBlur={() => {
                const parsed = parseInt(totalCycles, 10);
                if (isNaN(parsed) || 36 < parsed || parsed < 4) {
                  setSessionAmountError("Invalid number of sessions");
                  setTotalCycles(totalCycles.toString()); // eğer interval geçersiz ise eski değere geri dönülüyor
                } else {
                  setTotalCycles(parsed);
                  setSessionAmountError(""); // hata yoksa uyarıyı sil
                }
              }}
              type="number"
            />
            <label
              className="text-xs text-red-500 p-1 pb-0"
              htmlFor="interval_amount"
            >
              {sessionAmountError}
            </label>
          </div>
          <div className="flex flex-col">
            <div className="m-1 mt-3 mb-0 text-sm">Session change sound</div>
            <Field>
              <div className="relative">
                <Select
                  disabled={isStarted}
                  className={clsx(
                    "block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 mt-1 text-sm/6 text-white data-[disabled]:text-white/50",
                    "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
                    // Make the text of each option black on Windows
                    "*:text-black"
                  )}
                >
                  <option value="sound1">Simple Alert</option>
                  <option value="sound2">Ankara Metro Door</option>
                  <option value="sound3">Shika</option>
                  <option value="sound4">Guitar Riff</option>
                </Select>
                <ChevronDownIcon
                  className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                  aria-hidden="true"
                />
              </div>
            </Field>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
