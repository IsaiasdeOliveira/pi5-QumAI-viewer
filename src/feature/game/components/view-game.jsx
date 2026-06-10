import { useGameContext } from '../context/game-context';
import { useGameSocket } from '../hooks/useGameSocket';
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';
import { useNavigate } from 'react-router-dom'; // 1. Hook de navegação adicionado

export function ViewGame({ gameId }) {
  const { spectator } = useGameContext();
  const navigate = useNavigate(); // 2. Instância de navegação
  
  const { connected, gameState } = useGameSocket(
    gameId,
    spectator?.[gameId]?.spectator_access_token || null
  );

  // =========================================================================
  // CORREÇÃO DE MAPEAMENTO DA API: Lê as propriedades corretas do WebSocket
  // =========================================================================
  
  // Captura os dados dos jogadores independentemente de como o servidor os nomeia
  const turingPlayer = gameState?.turing_player || gameState?.player_1 || gameState?.player1;
  const lovelacePlayer = gameState?.lovelace_player || gameState?.player_2 || gameState?.player2;
  
  // Captura as estatísticas de status e turnos
  const statusPartida = gameState?.status || 'AGUARDANDO';
  const turnoAtual = gameState?.current_turn_number ?? gameState?.turn ?? 0;
  const timeDaVez = gameState?.current_turn_team_id ?? gameState?.current_turn; 

  // Captura a lista de logs tratando mapeamentos alternativos (logs, history, moves)
  const listaDeLogs = gameState?.logs || gameState?.history || gameState?.moves || [];

  return (
    <div className={cn('flex flex-col gap-6 py-4 w-full text-white flex-1 animate-fade-in bg-zinc-950 px-2 md:px-4')}>
      
      {/* 1. CABEÇALHO DA ARENA AO VIVO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-purple-500/10 pb-4 w-full gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
            Monitoramento de Partida em Tempo Real
          </span>
          <Typography variant={'h1'} asTag={'h1'} className="text-xl font-black text-zinc-100 tracking-wide mt-0.5">
            Arena do Conhecimento
          </Typography>
          <span className="text-xs font-mono text-zinc-500 mt-1 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800 break-all inline-block">
            Partida ID: <span className="text-purple-300 font-bold">{gameId}</span>
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
            <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-amber-500 animate-pulse')} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              {connected ? 'Socket Conectado' : 'Reconectando...'}
            </span>
          </div>

          <span className={cn(
            "text-xs px-2.5 py-1 rounded-lg border font-mono font-bold tracking-wide uppercase",
            statusPartida === 'FINISHED' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
          )}>
            ● {statusPartida}
          </span>
        </div>
      </div>

      {/* 2. LAYOUT EM DUAS COLUNAS (TABULEIRO / SIDEBAR HISTÓRICO) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full items-start">
        
        {/* COLUNA DA ESQUERDA (TABULEIRO + CONTROLE DE RODADA) */}
        <div className="lg:col-span-3 flex flex-col gap-4 w-full">
          
          {/* CONTROLE DE RODADA ATUALIZADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
            
            {/* TIME TURING */}
            <div className={cn(
              "p-3 rounded-lg border transition-all flex items-center gap-3",
              timeDaVez === 1 || timeDaVez === '1' ? "bg-purple-950/20 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.1)] font-bold" : "bg-zinc-950/40 border-zinc-800 opacity-50"
            )}>
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">Time Turing {timeDaVez === 1 && '• SUA VEZ'}</span>
                <span className="text-sm text-zinc-200 block truncate">
                  {turingPlayer?.ai_player_name || turingPlayer?.name || 'Turing Bot'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate">{turingPlayer?.group_name || 'Grupo 01'}</span>
              </div>
            </div>

            {/* TIME LOVELACE */}
            <div className={cn(
              "p-3 rounded-lg border transition-all flex items-center gap-3",
              timeDaVez === 2 || timeDaVez === '2' ? "bg-fuchsia-950/20 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.1)] font-bold" : "bg-zinc-950/40 border-zinc-800 opacity-50"
            )}>
              <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">Time Lovelace {timeDaVez === 2 && '• SUA VEZ'}</span>
                <span className="text-sm text-zinc-200 block truncate">
                  {lovelacePlayer?.ai_player_name || lovelacePlayer?.name || 'Aguardando Rival...'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block truncate">{lovelacePlayer?.group_name || 'Sem grupo'}</span>
              </div>
            </div>

          </div>

          {/* TABULEIRO DE ENTRADA */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center items-center">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3 w-full mb-4">
              <h3 className="font-bold text-sm tracking-wide text-zinc-300 font-mono">🏫 MONITOR DE SALAS DE AULA</h3>
              <span className="text-[11px] text-fuchsia-400 font-mono font-bold">Turno: #{turnoAtual}</span>
            </div>

            {gameState?.board ? (
              <div className="grid grid-cols-5 gap-3 w-full">
                {gameState.board.map((row, rIdx) => 
                  row.map((cell, cIdx) => {
                    const hasProf = !!cell?.professor;
                    return (
                      <div 
                        key={`${rIdx}-${cIdx}`}
                        className={cn(
                          'aspect-square flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-mono transition-all',
                          cell?.level === 1 && 'bg-purple-950/20 border-purple-500/20 text-purple-300',
                          cell?.level === 2 && 'bg-purple-950/40 border-purple-500/40 text-purple-200',
                          cell?.level === 3 && 'bg-fuchsia-950/40 border-fuchsia-500/40 text-fuchsia-200',
                          cell?.level === 4 && 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]',
                          (!cell || cell?.level === 0 || !cell?.level) && 'bg-zinc-950/60 border-zinc-800/60 text-zinc-600'
                        )}
                      >
                        <span className="text-[9px] font-bold opacity-30 block">{cell?.level ? `${cell.level}º Ano` : '0º Ano'}</span>
                        {hasProf && (
                          <span className="text-[9px] font-black bg-zinc-900 px-1.5 py-0.5 rounded border border-purple-500/30 truncate max-w-full text-purple-300 mt-2 shadow-md">
                            👤 {cell.professor}
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

        {/* COLUNA DA DIREITA: HISTÓRICO DE LOGS AUTOMÁTICO */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3 min-h-[420px] lg:max-h-[520px]">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
              Histórico de Ações
            </span>
            <span className="text-[9px] font-mono text-zinc-600 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
              FEED LIVE
            </span>
          </div>

          {/* LISTA DINÂMICA DE LOGS */}
          <div className="flex-1 overflow-y-auto font-mono text-[11px] flex flex-col gap-2 max-h-[440px] pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {listaDeLogs.length > 0 ? (
              listaDeLogs.map((log, index) => {
                // Filtra as propriedades caso o backend mande chaves diferentes
                const turnoLog = log?.turno || log?.turn || turnoAtual;
                const jogadorLog = log?.jogador || log?.player || log?.ai_player_name || 'Robô';
                const acaoLog = log?.acao || log?.message || log?.description || (typeof log === 'string' ? log : 'Fez uma jogada');
                const isTuring = log?.time === 1 || log?.team_id === 1;

                return (
                  <div key={index} className="border-b border-zinc-950 pb-2 last:border-none flex flex-col gap-0.5 border-dashed">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-purple-400 font-bold">[Turno #{turnoLog}]</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-xs">
                      <strong className={isTuring ? 'text-purple-400' : 'text-fuchsia-400'}>
                        {jogadorLog}:
                      </strong>{' '}
                      <span className="text-zinc-400">{acaoLog}</span>
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-zinc-600 italic flex flex-col items-center gap-2 flex-1 justify-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">Sem Movimentação</span>
                <p className="text-[10px] max-w-[160px] text-zinc-500 normal-case text-center">Os registros de quem andou, evoluiu sala ou ganhou aparecerão aqui automaticamente.</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-center text-[10px] uppercase font-bold tracking-wider text-purple-400">
            Turno atual: #{turnoAtual}
          </div>
        </div>

      </div>

    </div>
  );
}