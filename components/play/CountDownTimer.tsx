import React, { useState, useEffect } from "react";

interface commentProp {
    targetDate: number;
}
interface TimeDisplayValuesType {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }
  
  interface CounterType {
    displayValue: number;
    label: string;
  }
const CountDownTimer = ({ targetDate }: commentProp) => {
  const [remainSecond, setRemainSecond] = useState<TimeDisplayValuesType>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {

    const countDown = setInterval(() => {
        const rightJustNow = new Date().getTime();
        const runway = targetDate - rightJustNow;
        const stateObj = {
          days: Math.floor(runway / (1000 * 60 * 60 * 24)),
          hours: Math.floor((runway % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((runway % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((runway % (1000 * 60)) / 1000)
        };
      setRemainSecond(stateObj);

      if (!targetDate) {
        clearInterval(countDown);
      }
    }, 1000);

    return () => {
      clearInterval(countDown);
    };
  }, [targetDate]);
  


  return (
    <div className="contain">
      {remainSecond.days}:{remainSecond.hours}:{remainSecond.minutes}:{remainSecond.seconds}
    </div>
  );
};

export default CountDownTimer;