//import PelitaTournament from "./tournament";

"use client"

import { useEffect, useMemo, useState } from "react";
import Pelita from "../pelita";
import { conv_game_state, ObserveGameStateL } from "../pelita_msg";

import match01 from "./round1-match01-20240831-185932.json";
// import match02 from "./round1-match02-20240831-190026.json";
// import match03 from "./round1-match03-20240831-190128.json";
// import match04 from "./round1-match04-20240831-190254.json";
// import match05 from "./round1-match05-20240831-190351.json";
// import match06 from "./round1-match06-20240831-190445.json";
// import match07 from "./round1-match07-20240831-190546.json";
// import match08 from "./round1-match08-20240831-190639.json";
// import match09 from "./round1-match09-20240831-190747.json";
// import match10 from "./round1-match10-20240831-190845.json";
// import matchb_01 from "./round2-match01-20240831-191004.json";
// import matchb_02 from "./round2-match02-20240831-191214.json";
// import matchb_03 from "./round2-match03-20240831-191322.json";
// import matchb_04 from "./round2-match04-20240831-191433.json";


const match02: ObserveGameStateL = [];
const match03: ObserveGameStateL = [];
const match04: ObserveGameStateL = [];
const match05: ObserveGameStateL = [];
const match06: ObserveGameStateL = [];
const match07: ObserveGameStateL = [];
const match08: ObserveGameStateL = [];
const match09: ObserveGameStateL = [];
const match10: ObserveGameStateL = [];
const matchb_01: ObserveGameStateL = [];
const matchb_02: ObserveGameStateL = [];
const matchb_03: ObserveGameStateL = [];
const matchb_04: ObserveGameStateL = [];



// function PelitaReplayFile({src}: {src: string}) {
//   const file = await fs.readFile(process.cwd() + src, 'utf8');
//   const data = JSON.parse(file);
//   return (<PelitaReplay data={data}></PelitaReplay>);
// }

function PelitaReplay({data} : {data: any[]}) {
  const [state, setState] = useState(0);
  const [started, setStarted] = useState(false);
  let dataForced = data ; //as ObserveGameStateL;
  const matchConv = useMemo(() => dataForced.map(conv_game_state), [dataForced]);

  useEffect(() => {
    const id = setTimeout(() => {
      started &&
      setState((state) => {
        if (state + 1 < data.length)
          return state + 1
        else {
          clearTimeout(id);
          setStarted(false);
          return state;
        }
    });
    }, 40);
    return () => clearTimeout(id);
  }, [state, started, data.length])

  function back() {
    setStarted(false);
    setState(s => Math.max(s - 1, 0));
  }

  function step() {
    setStarted(false);
    setState(s => Math.min(s + 1, data.length - 1));
  }

  if (data.length == 0) return (<p><i>No match data</i></p>);

  return (
    <div className="">
    <Pelita animate={false} footer="" gameState={matchConv[state]}></Pelita>

    <div className="flex flex-row gap-4 items-center justify-between">
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded disabled:border-white-500"
      onClick={() => setState(0)}
      disabled={!state}
      >rewind</button>
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
      onClick={back}
      >back</button>
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
      onClick={() => setStarted(!started)}
      >{ started ? `pause` : `play` }</button>
    <button
      className="basis-1/4 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
      onClick={step}
      >step</button>
    </div>
    </div>
  );
}


export default function Home() {
  return (<>
    <main className={`max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16 px-24 py-12`}>
      <div className="font-mono text-sm">

        Καλησπέρα Rike, I am the Python drone. I am here to serve you.<br />
        Welcome to the Heraklion Pelita tournament 2024<br />
        This evening the teams are:<br />
        #0: group0<br />
        Johannes Kaminski<br />
        Jason Charamis<br />
        Francesco Alberti<br />
        Emilia Jarochowska<br />
        Larissa Behnke<br />
        Naz Belkaya<br />
        <br />
        #1: MAYorMAYnot<br />
        Stamatis Aliprantis<br />
        Adrià Marly<br />
        Karla Matic<br />
        Polina Arbuzova<br />
        Giovanni Ferrari<br />
        Mirja Grote Lambers<br />
        <br />
        #2: EmptyStupidBots<br />
        Ángel Blanco<br />
        Romain Guiet<br />
        Alessia Selmi<br />
        Maksim Valialshchikov<br />
        Patricia Brandl<br />
        Anna Székely<br />
        <br />
        #3: The 3Botsketeers<br />
        Antonin Fourcade<br />
        Anna Bogdanova<br />
        Stella Verkijk<br />
        John Carl Begley<br />
        Anthony Ciston<br />
        Berkutay Mert<br />
        <br />
        #4: We cant believe 4isfor4UN<br />
        Riccardo Cusinato<br />
        Jonas Scherer<br />
        Arianna Bienati<br />
        Johannes Mehrer<br />
        Victoria Shevchenko<br />
        Sarah Ashcroft-Jones<br />
        <br />
        These were the teams. Now you ready for the fight?<br />
        <br />
        ROUND 1 (Everybody vs Everybody)<br />
================================<br />
<br />
Starting match: The 3Botsketeers (group #3) vs group0 (group #0)<br />

<PelitaReplay data={match01}></PelitaReplay>

‘The 3Botsketeers’ wins<br />
<br />
Ranking after 1 match (9 to go):<br />
<pre><b>{`           The 3Botsketeers`}</b>{` 2
  `}<b>{`                   group0`}</b>{` 0
                MAYorMAYnot 0
            EmptyStupidBots 0
  We cant believe 4isfor4UN 0
`}</pre>
  <br />
Starting match: EmptyStupidBots (group #2) vs MAYorMAYnot (group #1)<br />

<PelitaReplay data={match02}></PelitaReplay>

‘EmptyStupidBots’ wins<br />
<br />
Ranking after 2 matches (8 to go):<br />
<pre><b>{`            EmptyStupidBots`}</b>{` 2
           The 3Botsketeers 2
                     group0 0
  `}<b>{`              MAYorMAYnot`}</b>{` 0
  We cant believe 4isfor4UN 0
  `}</pre>
  <br />
Starting match: group0 (group #0) vs We cant believe 4isfor4UN (group #4)<br />

<PelitaReplay data={match03}></PelitaReplay>

‘We cant believe 4isfor4UN’ wins<br />
<br />
Ranking after 3 matches (7 to go):<br />
<pre>{`            EmptyStupidBots 2
           The 3Botsketeers 2
  `}<b>{`We cant believe 4isfor4UN`}</b>{` 2
  `}<b>{`                   group0`}</b>{` 0
                MAYorMAYnot 0
`}</pre>
                <br />
Starting match: The 3Botsketeers (group #3) vs EmptyStupidBots (group #2)<br />

<PelitaReplay data={match04}></PelitaReplay>

‘The 3Botsketeers’ wins<br />
<br />
Ranking after 4 matches (6 to go):<br />
<pre><b>{`           The 3Botsketeers`}</b>{` 4
  `}<b>{`          EmptyStupidBots`}</b>{` 2
  We cant believe 4isfor4UN 2
                     group0 0
                MAYorMAYnot 0
                `}</pre>
                <br />
Starting match: MAYorMAYnot (group #1) vs We cant believe 4isfor4UN (group #4)<br />

<PelitaReplay data={match05}></PelitaReplay>

‘MAYorMAYnot’ wins<br />
<br />
Ranking after 5 matches (5 to go):<br />
<pre>{`           The 3Botsketeers 4
  `}<b>{`              MAYorMAYnot`}</b>{` 2
            EmptyStupidBots 2
  `}<b>{`We cant believe 4isfor4UN`}</b>{` 2
                     group0 0
                     `}</pre>
<br />
Starting match: EmptyStupidBots (group #2) vs group0 (group #0)<br />

<PelitaReplay data={match06}></PelitaReplay>

‘EmptyStupidBots’ wins<br />
<br />
Ranking after 6 matches (4 to go):<br />
<pre><b>{`            EmptyStupidBots`}</b>{` 4
           The 3Botsketeers 4
                MAYorMAYnot 2
  We cant believe 4isfor4UN 2
  `}<b>{`                   group0`}</b>{` 0
  `}</pre>
<br />
Starting match: MAYorMAYnot (group #1) vs The 3Botsketeers (group #3)<br />

<PelitaReplay data={match07}></PelitaReplay>

‘The 3Botsketeers’ wins<br />
<br />
Ranking after 7 matches (3 to go):<br />
<pre><b>{`           The 3Botsketeers`}</b>{` 6
            EmptyStupidBots 4
  `}<b>{`              MAYorMAYnot`}</b>{` 2
  We cant believe 4isfor4UN 2
                     group0 0
                     `}</pre>
<br />
Starting match: We cant believe 4isfor4UN (group #4) vs EmptyStupidBots (group #2)<br />

<PelitaReplay data={match08}></PelitaReplay>

‘EmptyStupidBots’ wins<br />
<br />
Ranking after 8 matches (2 to go):<br />
<pre><b>{`            EmptyStupidBots`}</b>{` 6
           The 3Botsketeers 6
                MAYorMAYnot 2
  `}<b>{`We cant believe 4isfor4UN`}</b>{` 2
                     group0 0
                     `}</pre>
<br />
Starting match: group0 (group #0) vs MAYorMAYnot (group #1)<br />

<PelitaReplay data={match09}></PelitaReplay>

‘MAYorMAYnot’ wins<br />
<br />
Ranking after 9 matches (1 to go):<br />
<pre>{`            EmptyStupidBots 6
           The 3Botsketeers 6
  `}<b>{`              MAYorMAYnot`}</b>{` 4
  We cant believe 4isfor4UN 2
  `}<b>{`                   group0`}</b>{` 0
  `}</pre>
<br />
Starting match: We cant believe 4isfor4UN (group #4) vs The 3Botsketeers (group #3)<br />

<PelitaReplay data={match10}></PelitaReplay>

‘The 3Botsketeers’ wins<br />
<br />
Ranking after 10 matches (0 to go):<br />
<pre><b>{`           The 3Botsketeers`}</b>{` 8
            EmptyStupidBots 6
                MAYorMAYnot 4
  `}<b>{`We cant believe 4isfor4UN`}</b>{` 2
                     group0 0
                     `}</pre>
<br />
ROUND 2 (K.O.)<br />
==============<br />
<br />
<pre>{` The 3Botsketeers ─────────┐
                           ├─ ??? ┐
 We cant believe 4isfor4UN ┘      │
                                  ├─ ??? ┐
 EmptyStupidBots ──────────┐      │      │  ┏━━━━━┓
                           ├─ ??? ┘      ├──┨ ??? ┃
 MAYorMAYnot ──────────────┘             │  ┗━━━━━┛
                                         │
 group0 ─────────────────────────────────┘
 `}</pre>
<br />
The 3Botsketeers v We cant believe 4isfor4UN<br />
<br />
Starting match: We cant believe 4isfor4UN (group #4) vs The 3Botsketeers (group #3)<br />

<PelitaReplay data={matchb_01}></PelitaReplay>

‘We cant believe 4isfor4UN’ wins<br />
<pre>{` The 3Botsketeers ─────────┐
                           ├─`}<b>{` We cant believe 4isfor4UN `}</b>{`┐
 We cant believe 4isfor4UN ┘                            │
                                                        ├─ ??? ┐
 EmptyStupidBots ──────────┐                            │      │  ┏━━━━━┓
                           ├─ ??? ──────────────────────┘      ├──┨ ??? ┃
 MAYorMAYnot ──────────────┘                                   │  ┗━━━━━┛
                                                               │
 group0 ───────────────────────────────────────────────────────┘
 `}</pre>
<br />
EmptyStupidBots v MAYorMAYnot<br />
<br />
Starting match: EmptyStupidBots (group #2) vs MAYorMAYnot (group #1)<br />

<PelitaReplay data={matchb_02}></PelitaReplay>

‘MAYorMAYnot’ wins<br />
<pre>{` The 3Botsketeers ─────────┐
                           ├─ We cant believe 4isfor4UN ┐
 We cant believe 4isfor4UN ┘                            │
                                                        ├─ ??? ┐
 EmptyStupidBots ──────────┐                            │      │  ┏━━━━━┓
                           ├─`}<b>{` MAYorMAYnot ──────────────`}</b>{`┘      ├──┨ ??? ┃
 MAYorMAYnot ──────────────┘                                   │  ┗━━━━━┛
                                                               │
 group0 ───────────────────────────────────────────────────────┘
`}</pre>
<br />
We cant believe 4isfor4UN v MAYorMAYnot<br />
<br />
Starting match: We cant believe 4isfor4UN (group #4) vs MAYorMAYnot (group #1)<br />

<PelitaReplay data={matchb_03}></PelitaReplay>

‘MAYorMAYnot’ wins<br />
<pre>{` The 3Botsketeers ─────────┐
                           ├─ We cant believe 4isfor4UN ┐
 We cant believe 4isfor4UN ┘                            │
                                                        ├─`}<b>{` MAYorMAYnot `}</b>{`┐
 EmptyStupidBots ──────────┐                            │              │  ┏━━━━━┓
                           ├─ MAYorMAYnot ──────────────┘              ├──┨ ??? ┃
 MAYorMAYnot ──────────────┘                                           │  ┗━━━━━┛
                                                                       │
 group0 ───────────────────────────────────────────────────────────────┘
 `}</pre>
<br />
MAYorMAYnot v group0<br />
<br />
Starting match: MAYorMAYnot (group #1) vs group0 (group #0)<br />

<PelitaReplay data={matchb_04}></PelitaReplay>

‘MAYorMAYnot’ wins<br />
<pre>{` The 3Botsketeers ─────────┐
                           ├─ We cant believe 4isfor4UN ┐
 We cant believe 4isfor4UN ┘                            │
                                                        ├─ MAYorMAYnot ┐
 EmptyStupidBots ──────────┐                            │              │  ┏━━━━━━━━━━━━━┓
                           ├─ MAYorMAYnot ──────────────┘              ├──┨`}<b>{` MAYorMAYnot `}</b>{`┃
 MAYorMAYnot ──────────────┘                                           │  ┗━━━━━━━━━━━━━┛
                                                                       │
 group0 ───────────────────────────────────────────────────────────────┘
 `}</pre>
<br />
The winner of the Heraklion Pelita tournament is... The winner of the Heraklion Pelita tournament is...<br />
group #1: MAYorMAYnot. Congratulations<br />
Εις το επανιδείν Rike. It was a pleasure to serve you.<br />

</div>
</main>
</>);
}
