//import PelitaTournament from "./tournament";

"use client"

import { ObserveGameStateL } from "@/app/pelita_msg";
import PelitaReplay, { ColorMap } from "@/app/pelita_replay";

import match01 from "./round1-match01-20250927-194437.json";

// import match02 from "./round1-match02-20250927-194609.json";
// import match03 from "./round1-match03-20250927-194659.json";
// import match04 from "./round1-match04-20250927-194816.json";
// import match05 from "./round1-match05-20250927-194913.json";
// import match06 from "./round1-match06-20250927-195048.json";
// import match07 from "./round1-match07-20250927-195148.json";
// import match08 from "./round1-match08-20250927-195240.json";
// import match09 from "./round1-match09-20250927-195416.json";
// import match10 from "./round1-match10-20250927-195525.json";
// import matchb_01a from "./round2-match01-20250927-195647.json";
// import matchb_01b from "./round2-match01-repeat2-20250927-195751.json";
// import matchb_02 from "./round2-match02-20250927-195854.json";
// import matchb_03 from "./round2-match03-20250927-195950.json";
// import matchb_04 from "./round2-match04-20250927-200044.json";

const match02: ObserveGameStateL = [];
const match03: ObserveGameStateL = [];
const match04: ObserveGameStateL = [];
const match05: ObserveGameStateL = [];
const match06: ObserveGameStateL = [];
const match07: ObserveGameStateL = [];
const match08: ObserveGameStateL = [];
const match09: ObserveGameStateL = [];
const match10: ObserveGameStateL = [];
const matchb_01a: ObserveGameStateL = [];
const matchb_01b: ObserveGameStateL = [];
const matchb_02: ObserveGameStateL = [];
const matchb_03: ObserveGameStateL = [];
const matchb_04: ObserveGameStateL = [];

const colorMap = {
  'group0/bot.py': 'purple',
  'group1/bot.py': 'darkcyan',
  'group2/bot.py': '#FF42A1',
  'group3/bot.py': 'orange',
  'group4/bot.py': 'rgb(71, 213, 69)',
};

// *** Please remember to copy the log files from store-Plovdiv-2025-12. ***

export default function Home() {
  return (<>
    <main className={`max-w-3xl mx-auto pt-10 xl:max-w-none xl:ml-0 xl:mr-[15.5rem] xl:pr-16 px-4 lg:px-24 py-4 lg:py-12 bg-white`}>
      <div className="font-mono text-sm">
        <ColorMap value={colorMap}>

<span lang="bg">Здравейте</span> Rike, I am the Python drone. I am here to serve you.<br />
Welcome to the Plovdiv Pelita tournament 2025<br />
This evening the teams are:<br />
<br />
#0: Zero Merci<br />
Julia Papiernik-Kłodzińska<br />
Julio Rodino<br />
Martin Constant<br />
Paula García<br />
Sofia Pelica<br />
<br />
#1: main<br />
Mihaela Mihaylova<br />
Niklas Hohmann<br />
Ourania Theologi<br />
Pedro Espinosa<br />
Roberta Cessa<br />
<br />
#2: Kukeri<br />
Anna Lena Lange<br />
Elena Pazhenkova<br />
Jakab Máté<br />
Lea Richtmann<br />
Małgorzata Wierzba<br />
Rosa Großmann<br />
<br />
#3: gittards<br />
Adam Cretton<br />
Antoniya Boyanova<br />
Bartosz Wojtaś<br />
Jiameng Wu<br />
Julia Dabrowska<br />
Nele Haferkorn<br />
<br />
#4: tmp<br />
Ece Kuru<br />
Georgii Dolgalev<br />
Golzar Atefi<br />
Mariia Koshkina<br />
Pallavi Bekal<br />
Simone Ciceri<br />
<br />
These were the teams. Now you ready for the fight?<br />
<br />
ROUND 1 (Everybody vs Everybody)<br />
================================<br />
<br />
<br />
Starting match: main (group #1) vs Zero Merci (group #0)<br />
<br />
<PelitaReplay data={match01}></PelitaReplay>
<br />
‘Zero Merci’ wins<br />
<br />
Ranking after 1 match (9 to go):<br />
<pre>{`  `}<b>{`               Zero Merci`}</b>{` 2
  `}<b>{`                     main`}</b>{` 0
                     Kukeri 0
                   gittards 0
                        tmp 0
`}</pre>
<br />
Starting match: gittards (group #3) vs Kukeri (group #2)<br />
<br />
<PelitaReplay data={match02}></PelitaReplay>

‘gittards’ wins<br />
<br />
Ranking after 2 matches (8 to go):<br />
<pre>{`                 Zero Merci 2
  `}<b>{`                 gittards`}</b>{` 2
                       main 0
  `}<b>{`                   Kukeri`}</b>{` 0
                        tmp 0
`}</pre>
<br />
Starting match: tmp (group #4) vs Zero Merci (group #0)<br />

<PelitaReplay data={match03}></PelitaReplay>

‘tmp’ wins<br />
<br />
Ranking after 3 matches (7 to go):<br />
<pre>{`  `}<b>{`               Zero Merci`}</b>{` 2
                   gittards 2
  `}<b>{`                      tmp`}</b>{` 2
                       main 0
                     Kukeri 0
`}</pre>
<br />
Starting match: gittards (group #3) vs main (group #1)<br />

<PelitaReplay data={match04}></PelitaReplay>

‘main’ wins<br />
<br />
Ranking after 4 matches (6 to go):<br />
<pre>{`                 Zero Merci 2
  `}<b>{`                     main`}</b>{` 2
  `}<b>{`                 gittards`}</b>{` 2
                        tmp 2
                     Kukeri 0
`}</pre>
<br />
Starting match: Kukeri (group #2) vs tmp (group #4)<br />

<PelitaReplay data={match05}></PelitaReplay>

‘Kukeri’ wins<br />
<br />
Ranking after 5 matches (5 to go):<br />
<pre>{`                 Zero Merci 2
                       main 2
  `}<b>{`                   Kukeri`}</b>{` 2
                   gittards 2
  `}<b>{`                      tmp`}</b>{` 2
`}</pre>
<br />
Starting match: Zero Merci (group #0) vs gittards (group #3)<br />

<PelitaReplay data={match06}></PelitaReplay>

‘gittards’ wins<br />
<br />
Ranking after 6 matches (4 to go):<br />
 <pre>{` `}<b>{`                  gittards`}</b>{` 4
  `}<b>{`               Zero Merci`}</b>{` 2
                       main 2
                     Kukeri 2
                        tmp 2
`}</pre>
<br />
Starting match: Kukeri (group #2) vs main (group #1)<br />

<PelitaReplay data={match07}></PelitaReplay>

‘Kukeri’ wins<br />
<br />
Ranking after 7 matches (3 to go):<br />
<pre>{`  `}<b>{`                   Kukeri`}</b>{` 4
                   gittards 4
                 Zero Merci 2
  `}<b>{`                     main`}</b>{` 2
                        tmp 2
`}</pre>
<br />
Starting match: tmp (group #4) vs gittards (group #3)<br />

<PelitaReplay data={match08}></PelitaReplay>

‘tmp’ wins<br />
<br />
Ranking after 8 matches (2 to go):<br />
<pre>{`                     Kukeri 4
  `}<b>{`                 gittards`}</b>{` 4
  `}<b>{`                      tmp`}</b>{` 4
                 Zero Merci 2
                       main 2
`}</pre>
<br />
Starting match: Zero Merci (group #0) vs Kukeri (group #2)<br />

<PelitaReplay data={match09}></PelitaReplay>

‘Kukeri’ wins<br />
<br />
Ranking after 9 matches (1 to go):<br />
<pre>{`  `}<b>{`                   Kukeri`}</b>{` 6
                   gittards 4
                        tmp 4
  `}<b>{`               Zero Merci`}</b>{` 2
                       main 2
`}</pre>
<br />
Starting match: main (group #1) vs tmp (group #4)<br />

<PelitaReplay data={match10}></PelitaReplay>

‘tmp’ wins<br />
<br />
Ranking after 10 matches (0 to go):<br />
<pre>{`                     Kukeri 6
  `}<b>{`                      tmp`}</b>{` 6
                   gittards 4
                 Zero Merci 2
  `}<b>{`                     main`}</b>{` 2
`}</pre>
<br />
<br />
ROUND 2 (K.O.)<br />
==============<br />
<br />

<pre>{`
 Kukeri ────┐
            ├─ ??? ┐
 Zero Merci ┘      │
                   ├─ ??? ┐
 tmp ───────┐      │      │  ┏━━━━━┓
            ├─ ??? ┘      ├──┨ ??? ┃
 gittards ──┘             │  ┗━━━━━┛
                          │
 main ────────────────────┘
`}</pre>

 <br />
Kukeri v Zero Merci<br />
<br />
Starting match: Kukeri (group #2) vs Zero Merci (group #0)<br />

<PelitaReplay data={matchb_01a}></PelitaReplay>

‘Kukeri’ and ‘Zero Merci’ had a draw.<br />
Draw → Now go for a Death Match!<br />
<br />
Starting match: Zero Merci (group #0) vs Kukeri (group #2)<br />

<PelitaReplay data={matchb_01b}></PelitaReplay>

‘Kukeri’ wins<br />

<pre>{` Kukeri ────┐
            ├─`}<b>{` Kukeri `}</b>{`┐
 Zero Merci ┘         │
                      ├─ ??? ┐
 tmp ───────┐         │      │  ┏━━━━━┓
            ├─ ??? ───┘      ├──┨ ??? ┃
 gittards ──┘                │  ┗━━━━━┛
                             │
 main ───────────────────────┘
`}</pre>
<br />
tmp v gittards<br />
<br />
Starting match: tmp (group #4) vs gittards (group #3)<br />

<PelitaReplay data={matchb_02}></PelitaReplay>

‘gittards’ wins<br />

<pre>{` Kukeri ────┐
            ├─ Kukeri ──┐
 Zero Merci ┘           │
                        ├─ ??? ┐
 tmp ───────┐           │      │  ┏━━━━━┓
            ├─`}<b>{` gittards `}</b>{`┘      ├──┨ ??? ┃
 gittards ──┘                  │  ┗━━━━━┛
                               │
 main ─────────────────────────┘
`}</pre>

Kukeri v gittards<br />
<br />
Starting match: gittards (group #3) vs Kukeri (group #2)<br />

<PelitaReplay data={matchb_03}></PelitaReplay>

‘gittards’ wins<br />

<pre>{` Kukeri ────┐
            ├─ Kukeri ──┐
 Zero Merci ┘           │
                        ├─`}<b>{` gittards `}</b>{`┐
 tmp ───────┐           │           │  ┏━━━━━┓
            ├─ gittards ┘           ├──┨ ??? ┃
 gittards ──┘                       │  ┗━━━━━┛
                                    │
 main ──────────────────────────────┘
`}</pre>

gittards v main<br />
<br />
Starting match: gittards (group #3) vs main (group #1)<br />

<PelitaReplay data={matchb_04}></PelitaReplay>

‘gittards’ wins<br />

<pre>{` Kukeri ────┐
            ├─ Kukeri ──┐
 Zero Merci ┘           │
                        ├─ gittards ┐
 tmp ───────┐           │           │  ┏━━━━━━━━━━┓
            ├─ gittards ┘           ├──┨`}<b>{` gittards `}</b>{`┃
 gittards ──┘                       │  ┗━━━━━━━━━━┛
                                    │
 main ──────────────────────────────┘
`}</pre>
<br />
The winner of the Plovdiv Pelita tournament is...<br />
group #3: <b>gittards</b>. Congratulations<br />
<span lang="bg">Чао</span> Rike. It was a pleasure to serve you.<br />

</ColorMap>
</div>
</main>
</>);
}
