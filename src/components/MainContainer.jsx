import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Input,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

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
  const [longBreakInterval, setLongBreakInterval] = useState(3); //kaç sessionda bir long break'a geçilecek?
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

      if (nextSessionCount % longBreakInterval === 0) {
        setActiveTab(2); //eğer 3 tane session yaptıysak long break'a geçiyoruz
        setTimeLeft(longBreakTime * 60);
      } else {
        //normal break
        setActiveTab(1);
        setTimeLeft(breakTime * 60);
      }
      setCompletedSessions(nextSessionCount);
    } else {
      setActiveTab(0);
      setTimeLeft(studyTime * 60);
    }
    setIsRunning(true); //timer otomatik olarak devam etmeli
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
            ></TimerTab>
          </TabPanel>
        </TabPanels>
      </TabGroup>
      <Disclosure as="div" className="pt-6">
        <DisclosureButton className="border-1 p-2 mt-0 m-2 w-fit  bg-gray-800 border-gray-700 rounded-xl group flex items-center justify-between cursor-pointer">
          <span className="text-sm/6 font-medium text-white group-data-hover:text-white/80">
            Settings
          </span>
        </DisclosureButton>
        <DisclosurePanel className="mt-2 max-w-2xs text-sm/5 text-white/50">
          Interval Amount{" "}
          <Input
            className="border-1 ml-1 w-10 rounded-md p-1"
            name="interval_amount"
            type="number"
          />
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
