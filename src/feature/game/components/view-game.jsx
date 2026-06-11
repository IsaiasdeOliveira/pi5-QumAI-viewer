import { useGameContext } from '../context/game-context';
import { useGameSocket } from '../hooks/useGameSocket';
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@core/helpers/fetch';
import { useEffect, useState } from 'react';

export function ViewGame({ gameId }) {
  const { spectator } = useGameContext();
  const navigate = useNavigate();

  const tokenEspectador = spectator?.[gameId]?.spectator_access_token || null;

  // 📡 Fonte de Verdade Principal (Socket ao vivo)
  const { connected, gameState } = useGameSocket(gameId, tokenEspectador);

  const [historicoHttp, setHistoricoHttp] = useState([]);

  // Busca HTTP de backup para o histórico
  async function carregarHistoricoBackup() {
    try {
      const options = tokenEspectador
        ? { headers: { Authorization: `Bearer ${tokenEspectador}` } }
        : {};
      const response = await apiClient(`/games/${gameId}/moves`, {
        method: 'GET',
        ...options,
      });

      let lista = Array.isArray(response)
        ? response
        : response?.moves || response?.history || response?.data || [];

      if (lista.length === 0) {
        const responseTurns = await apiClient(`/games/${gameId}/turns`, {
          method: 'GET',
          ...options,
        });
        lista = Array.isArray(responseTurns)
          ? responseTurns
          : responseTurns?.turns || [];
      }
      setHistoricoHttp(lista);
    } catch (e) {
      // Falha silenciosa para priorizar o socket
    }
  }

  useEffect(() => {
    if (gameId) {
      carregarHistoricoBackup();
    }
    const interval = setInterval(() => {
      if (gameId) carregarHistoricoBackup();
    }, 4000);

    return () => clearInterval(interval);
  }, [gameId, tokenEspectador]);

  // Unifica os movimentos priorizando o Socket
  const historicoDeMoves =
    gameState?.moves ||
    gameState?.turns ||
    gameState?.history ||
    historicoHttp ||
    [];

  // =========================================================================
  // 🎯 CAPTURA E FORMATAÇÃO DE IDs E NOMES (Anti-Bug de Servidor)
  // =========================================================================
  const turingPlayer =
    gameState?.turing_player || gameState?.player_1 || gameState?.player1;
  const lovelacePlayer =
    gameState?.lovelace_player || gameState?.player_2 || gameState?.player2;

  // 1. Helper para encurtar IDs longos (UUIDs) para não estourar o layout da tela
  const formatarIdOuNome = (playerData, campoNomeServidor, fallbackSuave) => {
    if (!gameState) return fallbackSuave;

    // Se o servidor mandou o nome direto em uma chave do root do gameState
    if (campoNomeServidor && gameState[campoNomeServidor]) {
      return gameState[campoNomeServidor];
    }

    // Se o playerData for uma string pura (o próprio ID ou Nome enviado pelo servidor)
    if (typeof playerData === 'string') {
      return playerData.length > 15
        ? `ID: ${playerData.substring(0, 8)}`
        : playerData;
    }

    // Se for um objeto, tenta mapear as chaves conhecidas do Swagger
    const nomeOuId =
      playerData?.ai_player_name ||
      playerData?.name ||
      playerData?.id ||
      playerData?.player_id ||
      playerData?.userId;

    if (nomeOuId) {
      return nomeOuId.length > 18
        ? `ID: ${nomeOuId.substring(0, 8)}`
        : nomeOuId;
    }

    return fallbackSuave;
  };

  // Resolve os identificadores de cada equipe
  const nomeTuring = formatarIdOuNome(turingPlayer, 'player1_name', 'QumAI');
  const nomeLovelace = formatarIdOuNome(
    lovelacePlayer,
    'player2_name',
    'Rival / Randômico'
  );

  // Captura os IDs reais do JSON para exibir no sub-rótulo do grupo
  const idRealTuring =
    gameState?.player1_id ||
    turingPlayer?.id ||
    turingPlayer?.player_id ||
    'ID: Turing';
  const idRealLovelace =
    gameState?.player2_id ||
    lovelacePlayer?.id ||
    lovelacePlayer?.player_id ||
    'ID: Lovelace';

  const grupoTuring =
    turingPlayer?.group_name ||
    (idRealTuring.length > 15
      ? `ID: ${idRealTuring.substring(0, 8)}`
      : idRealTuring);
  const grupoLovelace =
    lovelacePlayer?.group_name ||
    (idRealLovelace.length > 15
      ? `ID: ${idRealLovelace.substring(0, 8)}`
      : idRealLovelace);

  const statusPartida = gameState?.status || 'AGUARDANDO';
  const turnoAtual =
    gameState?.current_turn_number ??
    gameState?.turn ??
    historicoDeMoves.length;
  const timeDaVez = gameState?.current_turn_team_id ?? gameState?.current_turn;

  // =========================================================================
  // 🧭 MAPEAMENTO DE PROFESSORES
  // =========================================================================
  const professorTeams = { CLARO: 1, REY: 1, KARIN: 2, BEATRIZ: 2 };

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

  const ultimoMove =
    historicoDeMoves.length > 0
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
      {/* 1. CABEÇALHO */}
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

      {/* 2. PLACAR DOS JOGADORES */}
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
              <div className="text-xl mt-0.5">🟣</div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                  Time Turing {Number(timeDaVez) === 1 && '• SUA VEZ'}
                </span>
                <span className="text-sm text-zinc-200 block truncate font-extrabold text-purple-300">
                  {nomeTuring}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate font-medium mb-1">
                  Identificador: {grupoTuring}
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
              <div className="text-xl mt-0.5">🔴</div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                  Time Lovelace {Number(timeDaVez) === 2 && '• SUA VEZ'}
                </span>
                <span className="text-sm text-zinc-200 block truncate font-extrabold text-fuchsia-300">
                  {nomeLovelace}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate font-medium mb-1">
                  Identificador: {grupoLovelace}
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

        {/* COLUNA DA DIREITA: HISTÓRICO DINÂMICO */}
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
                if (!jogada) return null;

                const professorNome =
                  jogada.professor || move.professor || 'Professor';
                const isTuring =
                  move.team_id === 1 ||
                  move.team_id === '1' ||
                  move.teamId === 1 ||
                  professorTeams[professorNome] === 1;

                const rDest = jogada.move_to?.row ?? jogada.moveTo?.row ?? '?';
                const cDest = jogada.move_to?.col ?? jogada.moveTo?.col ?? '?';
                const rMen = jogada.mentor_at?.row ?? jogada.mentorAt?.row;
                const cMen = jogada.mentor_at?.col ?? jogada.mentorAt?.col;

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
                        moveu {professorNome} para ({rDest}, {cDest})
                        {rMen !== undefined && (
                          <span className="block text-[10px] text-zinc-500 italic mt-0.5">
                            ↳ Construiu na casa ({rMen}, {cMen})
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
