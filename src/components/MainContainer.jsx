import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Checkbox,
  Field,
  Button,
  Select,
  Input,
  Transition,
} from "@headlessui/react";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";

import TimerTab from "./TimerTab";

export default function MainContainer() {
  //üç ayrı (mod) için ayrı stateler, çünkü her birinin süresini biz değiştirebiliyoruz
  const [enabled, setEnabled] = useState(true);
  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
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
  const [totalCycles, setTotalCycles] = useState(4); //kaç session sonra çalışma tamamlanacak?
  const [longBreakEnabled, setLongBreakEnabled] = useState(false); //default olarak long break seçeneği erişilebilir olmasın.
  const [selectedSound, setSelectedSound] = useState("simple"); //hangi sesi seçtiğimize göre o sesi çalacağız, bunun için state tutuyoruz

  //bu fonksiyon ile hangi tabdaysak onun süresini oraya koymamızı sağlıyor.
  const tabRefs = useRef([]); //hangi tabda olduğumuzu framer için takip edeceğiz
  //ses dosyalarını çaldırmak için kullanacağımız şey
  const soundRef = useRef(null);

  tabRefs.current = []; //önceki referansları render öncesinde temizliyoruz
  //ses değiştirme dropdownunda her ses değişince corresponding sesi seçiyoruz
  useEffect(() => {
    const soundPaths = {
      simple: "/sounds/simple.mp3",
      metro: "/sounds/metro.mp3",
      shika: "/sounds/shika.mp3",
      karakara: "/sounds/karakara.mp3",
    };

    const selectedPath = soundPaths[selectedSound] || soundPaths.simple; //eğer seçilen yoksa default olanı kullanıyoruz

    soundRef.current = new Audio(selectedPath);
  }, [selectedSound]);

  //tabları kaydırmalı animasyon yapma denemesi, umarım başarılı olurum (framer motion hoş bir şeye benziyor)

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
      setActiveTab(0);
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
      setCompletedSessions(nextSessionCount); //tamamlanan session sayısını arttırıyoruz eğer bitmemiş ise
      // buradaki amaçlarımızdan birisi, son çalışma sessionu bittiyse direk bitirmek, dinlenmeden sonra da bitecek zaten.
      if (nextSessionCount >= totalCycles) {
        // toplam cycle hedefine ulaşıldıysa her şeyi durdur ve bitir!
        resetTimer(); // bu, zaten her şeyi yapıyor zaten
        return;
        //TODO: buraya daha sonra başka şeyler de yazılabilir tamamlama ile ilgili, tebrik ve ses, clap clap sesi koyulabilir
      }

      if (
        longBreakEnabled &&
        longBreakInterval > 0 &&
        nextSessionCount % longBreakInterval === 0
      ) {
        //long break
        setActiveTab(2);
        setTimeLeft(longBreakTime * 60);
      } else {
        //normal break
        setActiveTab(1);
        setTimeLeft(breakTime * 60);
      }
    } //eğer breakta isek bu sefer
    else {
      //study time
      setActiveTab(0);
      setTimeLeft(studyTime * 60);
    }
    setIsRunning(true); //geçişlerde otomatik olarak başlasın
    playSelectedSound(); //TODO: bu belki çalışmayabilir?
  };
  //timer durdurmak için
  const stopTimer = () => {
    setIsRunning(false); //sadece isRunning'i durduruyoruz, useEffect var zaten
  };

  const playSelectedSound = () => {
    if (soundRef.current) soundRef.current.currentTime = 0; //sesin baştan çalması için
    soundRef.current.play().catch((e) => {
      console.log("Ses çalınamadı", e);
    });
  };
  //longbreak interval ve kaç session olacağını girdiğimiz yerlerdeki inputların kontrolü
  useEffect(() => {
    const longParsed = parseInt(longBreakInput, 10);
    const totalParsed = parseInt(totalCycles, 10);

    // Long Break Interval Validation
    if ((isNaN(longParsed) && longParsed < 2) || longParsed > 12) {
      setLongBreakError("Must be between 2 and 12");
    } else if (totalParsed % longParsed !== 0) {
      setLongBreakError("Should divide total sessions evenly");
    } else {
      setLongBreakError("");
      if (longParsed !== longBreakInterval) {
        setLongBreakInterval(longParsed);
      }
    }
    // Total Sessions Validation
    if ((isNaN(totalParsed) && totalParsed < 2) || totalParsed > 36) {
      setSessionAmountError("Must be between 2 and 36");
    } else {
      setSessionAmountError("");
      if (totalParsed !== totalCycles) {
        setTotalCycles(totalParsed);
      }
    }
  }, [longBreakInput, totalCycles]);

  const tabNames = ["Study", "Break"];
  if (longBreakEnabled) {
    tabNames.push("Long Break");
  }

  useEffect(() => {
    if (!longBreakEnabled) {
      setLongBreakInterval(0);
    } else {
      const parsed = parseInt(longBreakInput, 10);
      if (!isNaN(parsed)) {
        setLongBreakInterval(parsed);
      }
    }
  }, [longBreakEnabled]);

  return (
    <div>
      <TabGroup
        selectedIndex={activeTab}
        onChange={setActiveTab}
        className={"w-72"}
      >
        <TabList className="relative tabs-container">
          {tabNames.map((name, index) => (
            <Tab
              key={index}
              ref={(el) => {
                if (el) tabRefs.current[index] = el;
              }}
              disabled={isStarted && isRunning && activeTab !== index}
              className="transition duration-300 rounded-full px-3 py-1 text-md/6 cursor-pointer text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 z-10 data-[selected]:bg-gray-700"
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
        <DisclosureButton className="border-1 p-2 mt-0 m-2 w-fit bg-gray-900 border-gray-700 rounded-full group flex items-center cursor-pointer data-[hover]:bg-gray-800 transition duration-300">
          <span className="flex pl-1.5 gap-3 w-full items-center text-sm/6 font-medium text-white">
            <div className="pl-1">Settings</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4 ml-auto mr-1"
            >
              <path
                fillRule="evenodd"
                d="M5.22 10.22a.75.75 0 0 1 1.06 0L8 11.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06ZM10.78 5.78a.75.75 0 0 1-1.06 0L8 4.06 6.28 5.78a.75.75 0 0 1-1.06-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </DisclosureButton>
        <Transition
          enter="transition-opacity duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0"
        >
          <DisclosurePanel className="mt-2 p-0.5 max-w-2xs text-sm/5 text-white/50">
            <div
              disabled={isStarted}
              className="flex flex-row gap-1 items-center p-1"
            >
              <Checkbox
                disabled={isStarted}
                checked={longBreakEnabled}
                onChange={setLongBreakEnabled}
                className="transition duration-300 cursor-pointer flex group size-6 rounded-md w-6 bg-white/10 p-1 ring-1 ring-white/15 ring-inset focus:not-data-focus:outline-none data-disabled:opacity-50 data-checked:bg-white data-focus:outline data-focus:outline-offset-2 data-focus:outline-white"
              >
                <CheckIcon className="invisible inline size-4 fill-black group-data-checked: group-data-checked:visible" />
              </Checkbox>
              <div className=" flex ml-1 text-sm my-auto select-none">
                Long Breaks
              </div>
            </div>
            {/* {longBreakEnabled && ( */}
            <div className="flex flex-col">
              <Transition
                show={longBreakEnabled}
                enter="transition duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div>
                  <div className="m-1 pt-1 select-none">
                    Long Break Interval Amount
                  </div>
                  <Input
                    disabled={isStarted}
                    className="px-3 py-1.5 mt-1 w-full rounded-lg text-sm/6 bg-white/5 text-white border border-gray-900 data-[disabled]:text-white/50"
                    name="lb_interval_amount"
                    min={2}
                    itemID="lb_interval_amount"
                    max={12}
                    value={longBreakInput}
                    onChange={(e) => setLongBreakInput(e.target.value)}
                    type="number"
                  />
                  <label
                    className="text-xs text-red-500 p-1 pb-0"
                    htmlFor="interval_amount"
                  >
                    {longBreakError}
                  </label>
                </div>
              </Transition>
            </div>
            {/*  )} */}
            <div className="flex flex-col">
              <div className="m-1 pt-1 select-none">Total Study Sessions</div>
              <Input
                disabled={isStarted}
                className="px-3 py-1.5 mt-1 w-full rounded-lg text-sm/6 bg-white/5 text-white border border-gray-900 data-[disabled]:text-white/50 hover:bg-gray-700 transition duration-300"
                name="interval_amount"
                min={2} //en az 1 long break olacak kadar olmalı
                itemID="interval_amount"
                max={36}
                value={totalCycles}
                onChange={(e) => setTotalCycles(e.target.value)}
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
              <div className="m-1 pt-1 select-none">Session change sound</div>
              <div className="flex flex-row gap-2 justify-between">
                <Field className="w-full">
                  <div className="relative">
                    <Select
                      disabled={isStarted}
                      value={selectedSound}
                      onChange={(e) => setSelectedSound(e.target.value)}
                      className={clsx(
                        "block w-full appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 mt-1 text-sm/6 text-white data-[disabled]:text-white/50 cursor-pointer transition duration-300",
                        "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25 ",
                        // Make the text of each option black on Windows
                        "*:text-black"
                      )}
                    >
                      <option value="simple">Simple Alert</option>
                      <option value="metro">Ankara Metro Door</option>
                      <option value="shika">Shika</option>
                      <option value="karakara">Karakara</option>
                    </Select>
                    <ChevronDownIcon
                      className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                      aria-hidden="true"
                    />
                  </div>
                </Field>
                <Button
                  disabled={isStarted}
                  onClick={playSelectedSound}
                  className="cursor-pointer inline w-min appearance-none rounded-lg border-none bg-white/5 px-3 py-1.5 mt-1 text-sm/6 text-white data-[disabled]:text-white/50 data-[hover]:bg-gray-700 transition duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.531l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z" />
                  </svg>
                </Button>
              </div>
            </div>
          </DisclosurePanel>
        </Transition>
      </Disclosure>
    </div>
  );
}
