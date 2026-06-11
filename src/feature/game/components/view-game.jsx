import { useGameContext } from '../context/game-context';
import { useGameSocket } from '../hooks/useGameSocket';
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function ViewGame({ gameId }) {
  const { spectator } = useGameContext();
  const navigate = useNavigate();

  const { connected, gameState } = useGameSocket(
    gameId,
    spectator?.[gameId]?.spectator_access_token || null
  );

  // =========================================================================
  // LOGICA DE HISTÓRICO: DE ACORDO COM O SWAGGER (FALLBACK MOVES -> TURNS)
  // =========================================================================
  const [historicoDeMoves, setHistoricoDeMoves] = useState([]);

  async function carregarHistorico() {
    try {
      // 1. Tenta buscar pelo endpoint /moves do Swagger
      let response = await apiClient(`/games/${gameId}/moves`, {
        method: 'GET',
      });

      let lista = Array.isArray(response)
        ? response
        : response?.moves || response?.history || response?.data || [];

      // 2. 🔥 ESTRATÉGIA SWAGGER: Se /moves vier baleado ou vazio, tenta o /turns imediatamente
      if (lista.length === 0) {
        const responseTurns = await apiClient(`/games/${gameId}/turns`, {
          method: 'GET',
        });
        lista = Array.isArray(responseTurns)
          ? responseTurns
          : responseTurns?.turns ||
            responseTurns?.history ||
            responseTurns?.data ||
            [];
      }

      setHistoricoDeMoves(lista);
    } catch (error) {
      console.error('Erro ao sincronizar histórico da API:', error);
    }
  }

  useEffect(() => {
    if (gameId) {
      carregarHistorico();
    }

    const atualizadorAutomatico = setInterval(() => {
      if (gameId) {
        carregarHistorico();
      }
    }, 2500);

    return () => clearInterval(atualizadorAutomatico);
  }, [gameId]);

  // =========================================================================
  // 👑 RESOLUTOR DE NOMES EXTRA-FLEXÍVEL (Trata Objetos, Strings e Fallbacks)
  // =========================================================================
  const obterNomeDoTime = (teamNum) => {
    if (!gameState) return teamNum === 1 ? 'Time Turing' : 'Time Lovelace';

    if (teamNum === 1) {
      return (
        gameState.player1_name ||
        gameState.turing_player_name ||
        gameState.player_1_name ||
        (typeof gameState.player1 === 'string'
          ? gameState.player1
          : gameState.player1?.name) ||
        (typeof gameState.turing_player === 'string'
          ? gameState.turing_player
          : gameState.turing_player?.name) ||
        gameState.players?.[0]?.name ||
        (typeof gameState.players?.[0] === 'string'
          ? gameState.players[0]
          : null) ||
        'QumAI'
      );
    } else {
      return (
        gameState.player2_name ||
        gameState.lovelace_player_name ||
        gameState.player_2_name ||
        (typeof gameState.player2 === 'string'
          ? gameState.player2
          : gameState.player2?.name) ||
        (typeof gameState.lovelace_player === 'string'
          ? gameState.lovelace_player
          : gameState.lovelace_player?.name) ||
        gameState.players?.[1]?.name ||
        (typeof gameState.players?.[1] === 'string'
          ? gameState.players[1]
          : null) ||
        'Rival'
      );
    }
  };

  const obterNomeDoGrupo = (teamNum) => {
    const pData =
      teamNum === 1
        ? gameState?.turing_player ||
          gameState?.player1 ||
          gameState?.players?.[0]
        : gameState?.lovelace_player ||
          gameState?.player2 ||
          gameState?.players?.[1];

    if (!pData || typeof pData === 'string')
      return teamNum === 1 ? 'Quantum_Machine' : 'Grupo Sistema';
    return (
      pData.group_name ||
      pData.group ||
      (teamNum === 1 ? 'Quantum_Machine' : 'Grupo Sistema')
    );
  };

  const nomeTuring = obterNomeDoTime(1);
  const grupoTuring = obterNomeDoGrupo(1);
  const nomeLovelace = obterNomeDoTime(2);
  const grupoLovelace = obterNomeDoGrupo(2);

  const statusPartida = gameState?.status || 'AGUARDANDO';
  const turnoAtual =
    gameState?.current_turn_number ??
    gameState?.turn ??
    (Array.isArray(historicoDeMoves) ? historicoDeMoves.length : 0);
  const timeDaVez = gameState?.current_turn_team_id ?? gameState?.current_turn;

  // =========================================================================
  // 🧭 MAPEAMENTO DE PROFESSORES PARA ACENDER O TABULEIRO
  // =========================================================================
  // Fallback estático idêntico ao bot.py para o frontend colorir as tags mesmo sem histórico pronto
  const professorTeams = {
    CLARO: 1,
    REY: 1,
    KARIN: 2,
    BEATRIZ: 2,
  };

  if (Array.isArray(historicoDeMoves)) {
    historicoDeMoves.forEach((move) => {
      const jogadaReal = move?.move_response || move?.move || move;
      if (jogadaReal?.professor) {
        const teamId = move.team_id ?? move.teamId ?? move.current_turn_team_id;
        if (teamId) professorTeams[jogadaReal.professor] = Number(teamId);
      }
    });
  }

  const turingProfs = Object.entries(professorTeams)
    .filter(([_, id]) => id === 1)
    .map(([p]) => p);
  const lovelaceProfs = Object.entries(professorTeams)
    .filter(([_, id]) => id === 2)
    .map(([p]) => p);

  // Identifica as coordenadas da última jogada executada no grid
  const ultimoMove =
    Array.isArray(historicoDeMoves) && historicoDeMoves.length > 0
      ? historicoDeMoves[historicoDeMoves.length - 1]
      : null;
  const ultimaJogadaReal =
    ultimoMove?.move_response || ultimoMove?.move || ultimoMove;
  const ultRow =
    ultimaJogadaReal?.move_to?.row ?? ultimaJogadaReal?.moveTo?.row;
  const ultCol =
    ultimaJogadaReal?.move_to?.col ?? ultimaJogadaReal?.moveTo?.col;

  return (
    <div
      className={cn(
        'flex flex-col gap-6 py-4 w-full text-white flex-1 animate-fade-in bg-zinc-950 px-2 md:px-4'
      )}
    >
      {/* 1. CABEÇALHO DA ARENA AO VIVO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-purple-500/10 pb-4 w-full gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
            Monitoramento de Partida em Tempo Real (Turno: {turnoAtual})
          </span>
          <Typography
            variant={'h1'}
            asTag={'h1'}
            className="text-xl font-black text-zinc-100 tracking-wide mt-0.5"
          >
            Partida
          </Typography>
          <span className="text-xs font-mono text-zinc-500 mt-1 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800 break-all inline-block">
            Partida ID:{' '}
            <span className="text-purple-300 font-bold">{gameId}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {statusPartida === 'FINISHED' && (
            <button
              onClick={() => navigate(`/game-details/${gameId}`)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all border border-purple-400"
            >
              Ver Detalhes da Partida
            </button>
          )}

          <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                connected
                  ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                  : 'bg-amber-500 animate-pulse'
              )}
            />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              {connected ? 'Socket Conectado' : 'Reconectando...'}
            </span>
          </div>

          <span
            className={cn(
              'text-xs px-2.5 py-1 rounded-lg border font-mono font-bold tracking-wide uppercase',
              statusPartida === 'FINISHED'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            )}
          >
            ● {statusPartida}
          </span>
        </div>
      </div>

      {/* 2. LAYOUT EM DUAS COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full items-start">
        <div className="lg:col-span-3 flex flex-col gap-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
            {/* TIME TURING */}
            <div
              className={cn(
                'p-3 rounded-lg border transition-all flex items-start gap-3',
                Number(timeDaVez) === 1
                  ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.1)] font-bold'
                  : 'bg-zinc-950/40 border-zinc-800 opacity-50'
              )}
            >
              <div className="text-xl mt-0.5" title="Legenda do Tabuleiro">
                🟣
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                  Time Turing {Number(timeDaVez) === 1 && '• SUA VEZ'}
                </span>
                <span className="text-sm text-zinc-200 block truncate font-extrabold text-purple-300">
                  {nomeTuring}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate font-medium mb-1">
                  Grupo: {grupoTuring}
                </span>

                <div className="flex flex-wrap gap-1 mt-2">
                  {turingProfs.map((prof) => (
                    <span
                      key={prof}
                      className="text-[9px] bg-purple-900/40 border border-purple-500/30 px-1.5 py-0.5 rounded text-purple-200 font-mono"
                    >
                      {prof}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TIME LOVELACE */}
            <div
              className={cn(
                'p-3 rounded-lg border transition-all flex items-start gap-3',
                Number(timeDaVez) === 2
                  ? 'bg-fuchsia-950/20 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.1)] font-bold'
                  : 'bg-zinc-950/40 border-zinc-800 opacity-50'
              )}
            >
              <div className="text-xl mt-0.5" title="Legenda do Tabuleiro">
                🔴
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                  Time Lovelace {Number(timeDaVez) === 2 && '• SUA VEZ'}
                </span>
                <span className="text-sm text-zinc-200 block truncate font-extrabold text-fuchsia-300">
                  {nomeLovelace}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate font-medium mb-1">
                  Grupo: {grupoLovelace}
                </span>

                <div className="flex flex-wrap gap-1 mt-2">
                  {lovelaceProfs.map((prof) => (
                    <span
                      key={prof}
                      className="text-[9px] bg-fuchsia-900/40 border border-fuchsia-500/30 px-1.5 py-0.5 rounded text-fuchsia-200 font-mono"
                    >
                      {prof}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TABULEIRO */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center items-center">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 w-full mb-4">
              <h3 className="font-bold text-sm tracking-wide text-zinc-300 font-mono">
                MONITOR DO TABULEIRO - MOVIMENTAÇÕES EM TEMPO REAL
              </h3>
            </div>

            {gameState?.board ? (
              <div className="grid grid-cols-5 gap-3 w-full">
                {gameState.board.map((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    const hasProf = !!cell?.professor;
                    const timeDoProf = professorTeams[cell?.professor];
                    const isUltimoDestino = ultRow === rIdx && ultCol === cIdx;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={cn(
                          'aspect-square flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-mono transition-all relative',
                          cell?.level === 1 &&
                            'bg-purple-950/20 border-purple-500/20 text-purple-300',
                          cell?.level === 2 &&
                            'bg-purple-950/40 border-purple-500/40 text-purple-200',
                          cell?.level === 3 &&
                            'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-200',
                          cell?.level === 4 &&
                            'bg-amber-500/10 border-amber-500 text-amber-300',
                          (!cell || cell?.level === 0 || !cell?.level) &&
                            'bg-zinc-950/60 border-zinc-800/60 text-zinc-600',
                          isUltimoDestino &&
                            'border-amber-400 ring-2 ring-amber-400/40 bg-zinc-900'
                        )}
                      >
                        {isUltimoDestino && (
                          <span className="absolute top-1 right-1 text-[7px] bg-amber-500 text-zinc-950 px-1 rounded font-sans font-black uppercase tracking-tighter scale-90">
                            Ação
                          </span>
                        )}
                        <span className="text-[9px] font-bold opacity-30 block">
                          {cell?.level ? `${cell.level}º Ano` : '0º Ano'}
                        </span>

                        {hasProf && (
                          <span
                            className={cn(
                              'text-[9px] font-black bg-zinc-900 px-1.5 py-0.5 rounded border truncate max-w-full mt-2 shadow-md flex items-center gap-1',
                              Number(timeDoProf) === 1 &&
                                'border-purple-500 text-purple-300',
                              Number(timeDoProf) === 2 &&
                                'border-fuchsia-500 text-fuchsia-300',
                              !timeDoProf && 'border-zinc-800 text-zinc-400'
                            )}
                          >
                            {Number(timeDoProf) === 1 && '🟣'}
                            {Number(timeDoProf) === 2 && '🔴'}
                            {!timeDoProf && '👤'}
                            <span>{cell.professor}</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="text-zinc-500 font-mono text-xs italic py-12">
                Aguardando carregamento da matriz da secretaria escolar...
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DA DIREITA: HISTÓRICO */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 min-h-[420px] lg:max-h-[520px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              Histórico de Ações
            </span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[11px] flex flex-col gap-2 max-h-[440px] pr-1 scrollbar-thin">
            {Array.isArray(historicoDeMoves) && historicoDeMoves.length > 0 ? (
              historicoDeMoves.map((move, index) => {
                const jogada = move.move_response || move?.move || move;
                if (!jogada || !jogada.professor) return null;
                const isTuring =
                  move.team_id === 1 ||
                  move.team_id === '1' ||
                  move.teamId === 1;

                return (
                  <div
                    key={index}
                    className="border-b border-zinc-950 pb-2 last:border-none flex flex-col gap-0.5 border-dashed"
                  >
                    <p className="text-zinc-300 leading-relaxed text-xs">
                      <strong
                        className={
                          isTuring ? 'text-purple-400' : 'text-fuchsia-400'
                        }
                      >
                        {isTuring ? nomeTuring : nomeLovelace}:
                      </strong>{' '}
                      <span className="text-zinc-400">
                        moveu {jogada.professor} para (
                        {jogada.move_to?.row ?? jogada.moveTo?.row},{' '}
                        {jogada.move_to?.col ?? jogada.moveTo?.col})
                        {(jogada.mentor_at || jogada.mentorAt) && (
                          <span className="block text-[10px] text-zinc-500 italic mt-0.5">
                            ↳ Construiu na casa (
                            {jogada.mentor_at?.row ?? jogada.mentorAt?.row},{' '}
                            {jogada.mentor_at?.col ?? jogada.mentorAt?.col})
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-zinc-600 italic flex flex-col items-center gap-2 flex-1 justify-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">
                  Sem Movimentação
                </span>
              </div>
            )}
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-center text-[10px] uppercase font-bold tracking-wider text-purple-400">
            Total de Ações: {historicoDeMoves?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
