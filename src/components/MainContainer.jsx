import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useState, useEffect } from "react";
import TimerTab from "./TimerTab";

export default function MainContainer() {
  //üç ayrı (mod) için ayrı stateler, çünkü her birinin süresini biz değiştirebiliyoruz
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
    if (intervalID) clearInterval(intervalID); //ilk başta timeri durduruyoruz.
    setIntervalID(null);
    setIsRunning(false);
    setTimeLeft(null); //zamanı da sıfırlıyoruz
    setIsStarted(false);
  };

  // timer'i başlatmak için.
  const startTimer = () => {
    setActiveTab(0);
    setIsRunning(true);
    setIsStarted(true);
    const totalSeconds = timeLeft ?? studyTime * 60; //studyTime dakika olarak tutuluyor, biz onu burada saniyeye çeviriyoruz (ve eğer devam eden süre varsa onu tutuyor ki sonraki basışımızda devam etsin)
    setTimeLeft(totalSeconds); // başlatırken zamanlayıcıdaki kalan zamanı studytime'ın saniye cinsinden olanu olarak belirliyoruz, zaten her türlü study moduna geçip orada başlayacağız
    //eğer daha önceden bir timer çalışıyorsa onu durduralım
    if (intervalID) {
      clearInterval(intervalID);
    }
    // zamanın ilerlemesi aşağıdakiler sayesinde
    const newInterval = setInterval(() => {
      //prev, saniye cinsinden kalan zaman ve o 1'e düşünce, zamanlayıcının biteceğini biliyoruz.
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(newInterval);
          handleNextPhase(); // sonraki sessionların ne olacağını söyler
          return 0; // 0 saniye, yani bitmiş bir timer döndürüyoruz
        }
        return prev - 1; // bir saniye daha geçiyor
      });
    }, 1000);

    setIntervalID(newInterval);
  };
  //sessionlar arası geçişleri ayarlamak için bir fonksiyon
  const handleNextPhase = () => {
    if (activeTab === 0) {
      const nextSessionCount = completedSessions + 1;
      setCompletedSessions(nextSessionCount);

      if (nextSessionCount % longBreakInterval === 0) {
        setActiveTab(2); //eğer 3 tane session yaptıysak long break'a geçiyoruz
        setTimeLeft(longBreakTime * 60);
      } else {
        //normal break
        setActiveTab(1);
        setTimeLeft(breakTime * 60);
      }
    } else {
      setActiveTab(0);
      setTimeLeft(studyTime * 60);
    }
  };
  //timer durdurmak için
  const stopTimer = () => {
    if (intervalID) {
      // eğer başlatılmış bir timer varsa
      clearInterval(intervalID); // prev değeri aynı kaldığı için timer duruyor, sıfırlanmıyor.
      setIntervalID(null);
    }
    setIsRunning(false);
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
      <Disclosure as="div" className="p-6">
        <DisclosureButton className="group flex w-full items-center justify-between">
          <span className="text-sm/6 font-medium text-white group-data-hover:text-white/80">
            Settings
          </span>
        </DisclosureButton>
        <DisclosurePanel className="mt-2 text-sm/5 text-white/50">
          If you're unhapp
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
