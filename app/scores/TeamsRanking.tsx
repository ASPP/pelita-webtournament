'use client';

import { md5 } from 'js-md5';
import { useEffect, useState } from 'react';
import React from 'react';

import { ColoredDot } from '@/app/utils/utils';

import { Team, Match, WinsLosses } from './models';
import { ReplayOverlay } from './ReplayOverlay';

export const HOST = 'https://pelita.itbportal.biologie.hu-berlin.de/pyapi';

export interface Replay {
  slug1: string;
  slug2: string;
  uuid: string;
}

function Matches({
  team,
  opponent,
  setReplay,
}: {
  team: string;
  opponent: string;
  setReplay: (replay: Replay | null) => void;
}) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch(`${HOST}/team_opponent/matches/${team}/${opponent}`)
      .then(r => r.json())
      .then(data => {
        setMatches(prev => data);
      });
  }, []);

  function DisplayMatch({ match }: { match: Match }) {
    // console.log(match);
    let color = 'red';
    switch (match.outcome) {
      case 0:
        color = 'red';
        break;
      case 1:
        color = 'orange';
        break;
      case 2:
        color = 'lightgreen';
        break;
      default:
        break;
    }
    // TODO: API should make it clear that this is only for the queried main team
    if (match.had_fatal_error) {
      color = 'black';
    }
    return (
      <>
        <ColoredDot color={color}></ColoredDot>
        {''}
      </>
    );
  }

  return (
    <>
      {matches.map(m => (
        <span
          className="cursor-pointer"
          key={m.game_uuid}
          onClick={() => {
            setReplay({
              slug1: m.team_color === 1 ? m.team : m.opponent,
              slug2: m.team_color === 1 ? m.opponent : m.team,
              uuid: m.game_uuid,
            });
          }}
        >
          <DisplayMatch match={m}></DisplayMatch>
        </span>
      ))}
    </>
  );
}

function TeamsRanking({ teams }: { teams: Team[] }) {
  const [expandTeam, setExpandTeam] = useState<string | null>(null);
  const [winsLosses, setWinsLosses] = useState<Record<string, WinsLosses[]>>({});
  const [matches, setMatches] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const [colorMode, setColorMode] = useState(false);

  const [replay, setReplay] = useState<Replay | null>(null);

  async function toggleTeam(slug: string) {
    if (expandTeam === slug) {
      setExpandTeam(null);
      return;
    }

    setExpandTeam(slug);

    // already cached locally → no refetch
    if (winsLosses[slug]) return;

    setLoading(true);
    try {
      const res = await fetch(`${HOST}/team_matches/${slug}`);
      const data = await res.json();

      setWinsLosses(prev => ({
        ...prev,
        [slug]: data,
      }));
    } finally {
      setLoading(false);
    }
  }

  const headers = ['Team', 'Matches', 'Wins', 'Draws', 'Losses', 'Score', 'μ', 'σ', 'Errors'];

  function colorFromString(str: string) {
    if (!colorMode) return;
    return `#${md5(str).slice(0, 6)}`;
  }

  const scores: Record<string, number> = Object.fromEntries(teams.map(t => [t.slug, t.score]));

  return (
    <>
      {/* <div className="w-sm">
        <PelitaReplay
          src="http://localhost:8000/game_replay/f09b7e25-c13e-4759-8bb0-1a5fd2fed147"
          rawGameState={true}
        ></PelitaReplay>
      </div> */}

      <h1 className="text-center italic">CI stats and replays</h1>

      <div className="basis-1/2 text-right">
        <span
          onClick={() => {
            setColorMode(old => !old);
          }}
        >
          {colorMode ? 'Color mode' : 'Classic mode'}
        </span>
      </div>

      <div className="relative overflow-x-auto shadow-xs rounded border border-neutral-800">
        <table className="w-full text-xs text-left rtl:text-right md:text-sm">
          <thead className="text-xs md:text-sm border-b-4 rounded border border-neutral-800">
            <tr>
              {headers.map(header => (
                <th key={header} className="px-2 md:px-6 py-1 md:py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams
              .toSorted((a, b) => a.score - b.score)
              .toReversed()
              .map(team => {
                const team_name = (
                  <>
                    {team.slug}{' '}
                    <span style={{ color: colorFromString(team.slug) }}>({team.display_name})</span>
                  </>
                );
                const padding =
                  expandTeam === team.slug && !loading && winsLosses[team.slug]
                    ? 'pt-1 md:pt-4 py-0.5'
                    : 'pt-1 md:py-4';

                const nMatches = team.wins + team.draws + team.losses;
                const percWins = ((team.wins / nMatches) * 100).toFixed(1);
                const percDraws = ((team.draws / nMatches) * 100).toFixed(1);
                const percLosses = ((team.losses / nMatches) * 100).toFixed(1);

                return (
                  <React.Fragment key={team.id}>
                    <tr
                      className="border-t border-neutral-800 hover:bg-amber-50 dark:hover:bg-gray-700"
                      onClick={() => toggleTeam(team.slug)}
                    >
                      <td className={`px-2 md:px-6 ${padding}`}>{team_name}</td>
                      <td className={`px-2 md:px-6 ${padding}`}>{nMatches}</td>
                      <td className={`px-2 md:px-6 ${padding}`} title={`${percWins} %`}>
                        {team.wins}
                      </td>
                      <td className={`px-2 md:px-6 ${padding}`} title={`${percDraws} %`}>
                        {team.draws}
                      </td>
                      <td className={`px-2 md:px-6 ${padding}`} title={`${percLosses} %`}>
                        {team.losses}
                      </td>
                      <td className={`px-2 md:px-6 ${padding}`}>
                        {team.score < 0 ? '' : <>&nbsp;</>}
                        {team.score.toFixed(2)}
                      </td>
                      <td className={`px-2 md:px-6 ${padding}`}>{team.mu.toFixed(2)}</td>
                      <td className={`px-2 md:px-6 ${padding}`}>{team.sigma.toFixed(2)}</td>
                      <td className={`px-2 md:px-6 ${padding}`}>{team.num_fatals}</td>
                    </tr>

                    {expandTeam === team.slug && loading && !winsLosses[team.slug] && (
                      <tr>
                        <td colSpan={8}>
                          <p>Loading...</p>
                        </td>
                      </tr>
                    )}

                    {expandTeam === team.slug && !loading && winsLosses[team.slug] && (
                      <>
                        {winsLosses[team.slug]
                          // .toSorted((a, b) => (a.wins - a.losses) / (a.draws + a.wins + a.losses) - (b.wins - b.losses)/ (b.draws + b.wins + b.losses))
                          // .toSorted((a, b) => a.draws + a.wins + a.losses - b.draws - b.wins - b.losses)
                          .toSorted((a, b) => scores[a.opponent] - scores[b.opponent])
                          .toReversed()
                          .map((a, idx) => {
                            const total = a.draws + a.wins + a.losses;
                            const score = (a.wins - a.losses) / total;
                            const padding =
                              idx === winsLosses[team.slug].length - 1
                                ? 'pb-1 md:pb-4 py-0.5'
                                : 'py-0.5';

                            const percWins = ((a.wins / total) * 100).toFixed(1);
                            const percDraws = ((a.draws / total) * 100).toFixed(1);
                            const percLosses = ((a.losses / total) * 100).toFixed(1);

                            return (
                              <tr
                                key={a.opponent}
                                className="hover:bg-amber-50 dark:hover:bg-gray-700"
                              >
                                <td className={`px-2 md:px-6 ${padding}`}>
                                  <span
                                    style={{
                                      color: colorFromString(a.opponent),
                                    }}
                                  >
                                    ᗧ
                                  </span>{' '}
                                  {a.opponent}
                                </td>
                                <td className={`px-2 md:px-6 ${padding}`}>{total}</td>
                                <td className={`px-2 md:px-6 ${padding}`} title={`${percWins} %`}>
                                  {a.wins}
                                </td>
                                <td className={`px-2 md:px-6 ${padding}`} title={`${percDraws} %`}>
                                  {a.draws}
                                </td>
                                <td className={`px-2 md:px-6 ${padding}`} title={`${percLosses} %`}>
                                  {a.losses}
                                </td>
                                <td className={`px-2 md:px-6 ${padding}`}>
                                  {score < 0 ? '' : <>&nbsp;</>}
                                  {score.toFixed(2)}
                                </td>
                                <td className={`px-2 md:px-6 ${padding}`} colSpan={4}>
                                  <Matches
                                    team={team.slug}
                                    opponent={a.opponent}
                                    setReplay={uuid => { setReplay(uuid); }}
                                  ></Matches>
                                </td>
                                <td></td>
                                <td></td>
                              </tr>
                            );
                          })}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {replay && (
        <ReplayOverlay
          replay={replay}
          closeReplayOverlay={() => {
            setReplay(null);
          }}
          colorMode={colorMode}
          colorFromString={colorFromString}
        />
      )}
    </>
  );
}

export default TeamsRanking;
