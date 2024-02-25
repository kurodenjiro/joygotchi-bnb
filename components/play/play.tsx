"use client";
import React, { useState , useRef  , useEffect} from "react";
import {
  Link,
  Image,
  Button
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import "../../styles/nes.css/css/nes.css"
import { Home } from "./home";
import { Pet } from "./pet";
import { Battle } from "./battle";
import { Breed } from "./breed";
import { Reward } from "./reward";
export const Play = () => {
  const [active, setActive] = useState("home");
  const messagesEndRef = useRef<null | HTMLDivElement>(null); 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, []);
  return (
    <>
      <main className="container mx-auto max-w-7xl  flex-grow" >
        {active == "home" && (
         <section className="h-full max-w-lg  mx-auto font-medium bg-slate-50 px-8 bg-no-repeat bg-cover" style={{ backgroundImage: "url(/Assets/landing.png)", height: "800px" }} >
            <Home />
          </section>
        )}
        {active == "pet" && (
          <section className="h-full max-w-lg  mx-auto font-medium bg-slate-50 px-8 bg-no-repeat bg-cover" style={{ backgroundImage: "url(/gotchi/Assets/Background.png)"   , height:"800px" }}>
            <Pet />
          </section>
        )}
        {active == "battle" && (
          <section className="h-full max-w-lg  mx-auto font-medium bg-slate-50 px-8 bg-no-repeat bg-cover" style={{ backgroundImage: "url(/gotchi/Assets/Background.png)"  , height:"800px" }}>
            <Battle />
          </section>
        )}
        {active == "breed" && (
          <section className="h-full max-w-lg  mx-auto font-medium bg-slate-50 px-8 bg-no-repeat bg-cover" style={{ backgroundImage: "url(/gotchi/Assets/Background.png)"   , height:"800px"}}>
            <Breed />
          </section>
        )}
        {active == "reward" && (
          <section className="h-full max-w-lg  mx-auto font-medium bg-slate-50 px-8 bg-no-repeat bg-cover" style={{ backgroundImage: "url(/gotchi/Assets/Background.png)"  , height:"800px" }}>
            <Reward />
          </section>
        )}
      
      <div className="">
        <div className={"grid h-full max-w-lg grid-cols-5 mx-auto font-medium bg-no-repeat bg-cover "} style={{ backgroundImage: "url(/gotchi/Assets/HUDBar2.png)"  }}>
          <Link
            onClick={() => setActive("home")} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group pt-2">
            <Image
              radius={"none"}
              width={50}
              src="/gotchi/Assets/Icon_Home.png"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"></span>
          </Link>
          <Link onClick={() => setActive("pet")} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group pt-2">
            <Image
              radius={"none"}
              width={50}
              src="/gotchi/Assets/Icon_Pet.png"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"></span>
          </Link>
          <Link onClick={() => setActive("battle")} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group pt-2">

            <Image
              radius={"none"}
              width={50}
              src="/gotchi/Assets/Icon_Battle.png"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"></span>
          </Link>
          <Link onClick={() => setActive("reward")} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group pt-2">
            <Image
              radius={"none"}
              width={50}
              src="/gotchi/Assets/Icon_Reward.png"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"></span>
          </Link>
          <Link onClick={() => setActive("breed")} className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group pt-2">
            <Image
              radius={"none"}
              width={50}
              src="/Assets/EggIcon.png"
            />
            <span className="text-sm text-gray-500 text-gray-500  group-hover:text-blue-600 dark:group-hover:text-blue-500"></span>
          </Link>
        </div>
        <div ref={messagesEndRef} />
      </div>
      </main>
    </>
  );
};
