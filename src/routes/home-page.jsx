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
    <div className={cn('flex flex-col gap-4 py-8', 'flex-1')}>
      <Typography
        variant={'h1'}
        asTag={'h1'}
        className={cn('text-4xl', 'font-bold')}
      >
        Partidas
      </Typography>
      {loading && <h3>Carregando partidas...</h3>}

      {/* CORREÇÃO AQUI: Acessando .message para renderizar uma String válida */}
      {error && (
        <h3 className="text-red-500">
          Erro: {error.message || 'Falha ao carregar partidas'}
        </h3>
      )}

      {partidas?.items?.map((game, g) => {
        return (
          <div
            key={g}
            className={cn(
              'bg-white',
              'p-4',
              'flex',
              'flex-row',
              'items-center',
              'justify-between',
              'shadow',
              'rounded-md'
            )}
          >
            <Typography
              variant={'span'}
              asTag={'p'}
              className={cn('text-xs', 'font-semibold')}
            >
              #{game.id}
            </Typography>
            <Typography variant={'h5'} asTag={'h5'}>
              Status: {game?.status}
            </Typography>
            {game?.status !== 'FINISHED' && (
              <Link
                to={`/spectate/${game.id}`}
                className={cn(
                  'px-4',
                  'py-2',
                  'bg-blue-500',
                  'text-white',
                  'rounded-md',
                  'hover:bg-blue-600',
                  'transition-colors'
                )}
              >
                Ver Partida
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
