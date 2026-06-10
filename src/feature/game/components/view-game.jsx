import { useGameContext } from '../context/game-context';
import { useGameSocket } from '../hooks/useGameSocket';
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom'; // 1. Hook de navegação adicionado
=======
import { apiClient } from '@core/helpers/fetch';
import { useEffect, useState } from 'react';
>>>>>>> 63d127ac6cdc6091e2467dc889fa41750a32db4f

export function ViewGame({ gameId }) {
  const { spectator } = useGameContext();
  const navigate = useNavigate(); // 2. Instância de navegação
  
  const { connected, gameState } = useGameSocket(
    gameId,
    spectator?.[gameId]?.spectator_access_token || null
  );

  // =========================================================================
  // LOGICA DE HISTÓRICO HTTP EM TEMPO REAL
  // =========================================================================
  const [historicoDeMoves, setHistoricoDeMoves] = useState([]);

  async function carregarHistorico() {
    try {
      const moves = await apiClient(`/games/${gameId}/moves`, {
        method: 'GET',
      });
      setHistoricoDeMoves(moves);
    } catch (error) {
      console.error('Erro ao carregar o histórico:', error);
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
    }, 2000);

    return () => clearInterval(atualizadorAutomatico);
  }, [gameId]);

  // Captura os dados dos jogadores independentemente de como o servidor os nomeia
  const turingPlayer =
    gameState?.turing_player || gameState?.player_1 || gameState?.player1;
  const lovelacePlayer =
    gameState?.lovelace_player || gameState?.player_2 || gameState?.player2;

  // Captura as estatísticas de status e turnos
  const statusPartida = gameState?.status || 'AGUARDANDO';
  const turnoAtual = gameState?.current_turn_number ?? gameState?.turn ?? 0;
  const timeDaVez = gameState?.current_turn_team_id ?? gameState?.current_turn;

  // =========================================================================
  // ── DETECTOR INTELIGENTE DE TIMES E ÚLTIMO MOVIMENTO ──
  // =========================================================================

  // 1. Cria um mapeamento dinâmico de qual professor pertence a qual time
  const professorTeams = {};
  historicoDeMoves.forEach((move) => {
    if (move?.move_response?.professor) {
      professorTeams[move.move_response.professor] = move.team_id;
    }
  });

  // 2. Filtra as listas de professores de cada time para a legenda
  const turingProfs = Object.entries(professorTeams)
    .filter(([_, teamId]) => teamId === 1)
    .map(([prof]) => prof);

  const lovelaceProfs = Object.entries(professorTeams)
    .filter(([_, teamId]) => teamId === 2)
    .map(([prof]) => prof);

  // 3. Descobre as coordenadas exatas de onde aconteceu a última jogada
  const ultimoMove = historicoDeMoves[historicoDeMoves.length - 1];
  const ultRow = ultimoMove?.move_response?.move_to?.row;
  const ultCol = ultimoMove?.move_response?.move_to?.col;

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
            Monitoramento de Partida em Tempo Real
          </span>
          <Typography
            variant={'h1'}
            asTag={'h1'}
            className="text-xl font-black text-zinc-100 tracking-wide mt-0.5"
          >
            Arena do Conhecimento
          </Typography>
          <span className="text-xs font-mono text-zinc-500 mt-1 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800 break-all inline-block">
            Partida ID:{' '}
            <span className="text-purple-300 font-bold">{gameId}</span>
          </span>
        </div>

        {/* STATUS DA CONEXÃO & BOTÃO DE DETALHES */}
        <div className="flex items-center gap-3">
          
          {/* 3. Renderização Condicional do Botão (Aparece apenas quando FINISHED) */}
          {statusPartida === 'FINISHED' && (
            <button
              onClick={() => navigate(`/game-details/${gameId}`)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] animate-pulse hover:animate-none border border-purple-400"
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
        {/* COLUNA DA ESQUERDA (TABULEIRO + CONTROLE DE RODADA) */}
        <div className="lg:col-span-3 flex flex-col gap-4 w-full">
          {/* CONTROLE DE RODADA COM LEGENDA DE PROFESSORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
            {/* TIME TURING (Seu Time) */}
            <div
              className={cn(
                'p-3 rounded-lg border transition-all flex items-start gap-3',
                timeDaVez === 1 || timeDaVez === '1'
                  ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.1)] font-bold'
                  : 'bg-zinc-950/40 border-zinc-800 opacity-50'
              )}
            >
              <div className="text-xl mt-0.5" title="Legenda do Tabuleiro">
                🟣
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                  Time Turing {timeDaVez === 1 && '• SUA VEZ'}
                </span>
                <span className="text-sm text-zinc-200 block truncate font-extrabold text-purple-300">
                  {turingPlayer?.ai_player_name ||
                    turingPlayer?.name ||
                    'QumAI'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate font-medium mb-1">
                  Grupo: {turingPlayer?.group_name || 'Quantum_Machine'}
                </span>

                {/* Lista de Professores do Turing */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {turingProfs.length > 0 ? (
                    turingProfs.map((prof) => (
                      <span
                        key={prof}
                        className="text-[9px] bg-purple-900/40 border border-purple-500/30 px-1.5 py-0.5 rounded text-purple-200 font-mono"
                      >
                        {prof}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-zinc-600 italic font-mono">
                      Mapeando professores...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* TIME LOVELACE (Adversário) */}
            <div
              className={cn(
                'p-3 rounded-lg border transition-all flex items-start gap-3',
                timeDaVez === 2 || timeDaVez === '2'
                  ? 'bg-fuchsia-950/20 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.1)] font-bold'
                  : 'bg-zinc-950/40 border-zinc-800 opacity-50'
              )}
            >
              <div className="text-xl mt-0.5" title="Legenda do Tabuleiro">
                🔴
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                  Time Lovelace {timeDaVez === 2 && '• SUA VEZ'}
                </span>
                <span className="text-sm text-zinc-200 block truncate font-extrabold text-fuchsia-300">
                  {lovelacePlayer?.ai_player_name ||
                    lovelacePlayer?.name ||
                    'Rival / Bot Randômico'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate font-medium mb-1">
                  Grupo: {lovelacePlayer?.group_name || 'Sistema da Arena'}
                </span>

                {/* Lista de Professores do Lovelace */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {lovelaceProfs.length > 0 ? (
                    lovelaceProfs.map((prof) => (
                      <span
                        key={prof}
                        className="text-[9px] bg-fuchsia-900/40 border border-fuchsia-500/30 px-1.5 py-0.5 rounded text-fuchsia-200 font-mono"
                      >
                        {prof}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] text-zinc-600 italic font-mono">
                      Mapeando professores...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TABULEIRO DE ENTRADA */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center items-center">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 w-full mb-4">
              <h3 className="font-bold text-sm tracking-wide text-zinc-300 font-mono">
                🏫 MONITOR DE SALAS DE AULA
              </h3>
            </div>

            {gameState?.board ? (
              <div className="grid grid-cols-5 gap-3 w-full">
                {gameState.board.map((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    const hasProf = !!cell?.professor;

                    // Identifica o time dono desse professor específico
                    const timeDoProf = professorTeams[cell?.professor];

                    // Verifica se esta casa foi o destino exato da última ação
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
                            'bg-amber-500/10 border-amber-500 text-amber-300 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]',
                          (!cell || cell?.level === 0 || !cell?.level) &&
                            'bg-zinc-950/60 border-zinc-800/60 text-zinc-600',
                          isUltimoDestino &&
                            'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.6)] bg-zinc-900 animate-pulse'
                        )}
                      >
                        {/* Tag discreta indicando que foi ali a última movimentação */}
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
                              timeDoProf === 1 &&
                                'border-purple-500 text-purple-300 shadow-[0_0_6px_rgba(168,85,247,0.2)]',
                              timeDoProf === 2 &&
                                'border-fuchsia-500 text-fuchsia-300 shadow-[0_0_6px_rgba(217,70,239,0.2)]',
                              !timeDoProf && 'border-zinc-800 text-zinc-400'
                            )}
                          >
                            {/* Pontinho indicador de equipe */}
                            {timeDoProf === 1 && '🟣'}
                            {timeDoProf === 2 && '🔴'}
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

        {/* COLUNA DA DIREITA: HISTÓRICO DE LOGS HTTP REAL */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 min-h-[420px] lg:max-h-[520px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              Histórico de Ações
            </span>
            <span className="text-[9px] font-mono text-zinc-600 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
              REGISTRO OFICIAL
            </span>
          </div>

          {/* LISTA DINÂMICA DE MOVES */}
          <div className="flex-1 overflow-y-auto font-mono text-[11px] flex flex-col gap-2 max-h-[440px] pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {historicoDeMoves.length > 0 ? (
              historicoDeMoves.map((move, index) => {
                const jogada = move.move_response;
                if (!jogada || !jogada.professor) return null;
                const isTuring = move.team_id === 1;

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
                        {isTuring ? 'Turing' : 'Lovelace'}:
                      </strong>{' '}
                      <span className="text-zinc-400">
                        moveu {jogada.professor} para ({jogada.move_to?.row},{' '}
                        {jogada.move_to?.col})
                        {jogada.mentor_at && (
                          <span className="block text-[10px] text-zinc-500 italic mt-0.5">
                            ↳ Construiu na casa ({jogada.mentor_at.row},{' '}
                            {jogada.mentor_at.col})
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
                <p className="text-[10px] max-w-[160px] text-zinc-500 normal-case text-center">
                  Nenhuma ação registrada no servidor ainda.
                </p>
              </div>
            )}
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-center text-[10px] uppercase font-bold tracking-wider text-purple-400">
            Total de Ações: {historicoDeMoves.length}
          </div>
        </div>
      </div>
    </div>
  );
}
