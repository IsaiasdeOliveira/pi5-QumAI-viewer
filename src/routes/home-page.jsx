import { cn } from '@core/helpers';
import { listGames } from '@feature/game/api';
import { Typography } from '@ui/text/typography';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

export function HomePage() {
  const [partidas, setPartidas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function buscarPartidas() {
    setLoading(true);
    try {
      const response = await listGames();
      setPartidas(response);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarPartidas();
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col gap-6 py-8 px-4 bg-zinc-950 min-h-screen text-white flex-1'
      )}
    >
      {/* Cabeçalho com Linha Neon Discreta */}
      <div className="flex justify-between items-center border-b border-purple-500/20 pb-4">
        <Typography
          variant={'h1'}
          asTag={'h1'}
          className={cn(
            'text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent'
          )}
        >
          Partidas
        </Typography>
        <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-mono">
          {partidas?.items?.length || 0} Arenas
        </span>
      </div>

      {loading && (
        <div className="text-center py-12 text-purple-400 font-medium animate-pulse">
          Carregando arenas do servidor...
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-md">
          <h3 className="text-red-500">
            Erro: {error.message || 'Falha ao carregar partidas'}
          </h3>
        </div>
      )}

      {/* Grid de Confrontos */}
      <div className="grid grid-cols-1 gap-4">
        {partidas?.items?.map((game, g) => {
          const isFinished = game?.status === 'FINISHED';
          const isRunning = game?.status === 'RUNNING';

          return (
            <div
              key={g}
              className={cn(
                'bg-zinc-900/80 border border-purple-950/60 p-5',
                'flex flex-col md:flex-row gap-4 items-center justify-between',
                'shadow-xl rounded-xl transition-all duration-300',
                'hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
              )}
            >
              {/* LADO ESQUERDO: Identificador e Tag de Status */}
              <div className="flex flex-col gap-1 items-center md:items-start">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Match ID
                </span>
                <Typography
                  variant={'span'}
                  asTag={'p'}
                  className={cn('text-sm font-bold font-mono text-purple-300')}
                >
                  #{game.id?.slice(0, 8) || game.id}
                </Typography>

                {/* Badge de Status estilizada */}
                <span
                  className={cn(
                    'mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border',
                    isRunning &&
                      'bg-green-500/10 text-green-400 border-green-500/30 animate-pulse',
                    isFinished && 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    !isRunning &&
                      !isFinished &&
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  )}
                >
                  {isRunning ? '● AO VIVO' : game?.status}
                </span>
              </div>

              {/* MEIO: Painel Versus (Corrigido para mapear turing_player e lovelace_player) */}
              <div className="flex items-center gap-6 my-2 md:my-0 bg-zinc-950/40 px-6 py-2 rounded-xl border border-zinc-800/60">
                {/* Jogador Turing (Alinhado à direita) */}
                <div className="flex items-center gap-3 w-36 justify-end">
                  <span className="text-sm font-semibold truncate text-zinc-200">
                    {game?.turing_player?.ai_player_name || 'Turing Bot'}
                  </span>
                  <img
                    src={
                      game?.turing_player?.ai_player_avatar ||
                      'https://api.dicebear.com/7.x/bottts/svg?seed=turing'
                    }
                    alt="Avatar Turing"
                    className="w-9 h-9 rounded-full border border-purple-500/40 bg-purple-950/20 object-cover"
                  />
                </div>

                {/* Divisor "VS" estilizado */}
                <span className="text-xs font-black text-purple-500/60 italic font-mono bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
                  VS
                </span>

                {/* Jogador Lovelace (Alinhado à esquerda) */}
                <div className="flex items-center gap-3 w-36">
                  <img
                    src={
                      game?.lovelace_player?.ai_player_avatar ||
                      'https://api.dicebear.com/7.x/bottts/svg?seed=lovelace'
                    }
                    alt="Avatar Lovelace"
                    className="w-9 h-9 rounded-full border border-fuchsia-500/40 bg-fuchsia-950/20 object-cover"
                  />
                  <span className="text-sm font-semibold truncate text-zinc-200">
                    {game?.lovelace_player?.ai_player_name || 'Lovelace Bot'}
                  </span>
                </div>
              </div>

              {/* LADO DIREITO: Botão de Ação Inteligente */}
              <div className="w-full md:w-auto">
                <Link
                  to={`/spectate/${game.id}`}
                  className={cn(
                    'px-5 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 block text-center min-w-[140px]',
                    isFinished
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                      : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_4px_12px_rgba(168,85,247,0.3)] hover:brightness-110 hover:shadow-[0_4px_20px_rgba(168,85,247,0.5)]'
                  )}
                >
                  {isFinished ? 'Ver Detalhes' : 'Ver Partida'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
