
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { conv_game_state } from "./pelita_msg";
import Pelita from "./pelita";

export const ColorMap = createContext({});

export default function PelitaReplay({data} : {data: any[]}) {
  const [position, setPosition] = useState(0);
  const [started, setStarted] = useState(false);
  const delay = 40;
  const colorMap = useContext(ColorMap);

  const dataForced = data ; //as ObserveGameStateL;
  if (dataForced[1] && dataForced[1].team_names[0] && !dataForced[0].team_names[0]) {
    dataForced[0].team_names[0] = dataForced[1].team_names[0];
  }
  if (dataForced[1] && dataForced[1].team_names[1] && !dataForced[0].team_names[1]) {
    dataForced[0].team_names[1] = dataForced[1].team_names[1];
  }
  const matchConv = useMemo(() => dataForced.map(conv_game_state), [dataForced]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!started)
        return;

      setPosition((state) => {
        if (state + 1 < data.length)
          return state + 1
        else {
          clearTimeout(id);
          setStarted(false);
          return state;
        }
    });
    }, delay);
    return () => { clearTimeout(id); };
  }, [position, started, data.length]);

  function back() {
    setStarted(false);
    setPosition(s => Math.max(s - 1, 0));
  }

  function step() {
    setStarted(false);
    setPosition(s => Math.min(s + 1, data.length - 1));
  }

  if (data.length == 0) return (<p><i>No match data</i></p>);

  const colors: [string, string] = ["rgb(94, 158, 217)", "rgb(235, 90, 90)"];

  const team_specs: [string, string] = data[0].team_specs;
  // console.log(team_specs);
  if (team_specs && team_specs[0] in colorMap) {
    colors[0] = colorMap[team_specs[0] as keyof typeof colorMap];
  }

  if (team_specs && team_specs[1] in colorMap) {
    colors[1] = colorMap[team_specs[1] as keyof typeof colorMap];
  }

  return (
    <div className="">
    <Pelita do_animate={false} footer="" colors={colors} gameState={matchConv[position]}></Pelita>

    <div className="flex flex-row gap-4 items-center justify-between">
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded disabled:border-white-500"
      onClick={() => { setPosition(0); }}
      disabled={!position}
      >rewind</button>
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
      onClick={back}
      >back</button>
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
      onClick={() => { setStarted(!started); }}
      >{ started ? `pause` : `play` }</button>
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
      onClick={step}
      >step</button>
    </div>
    </div>
  );
}
