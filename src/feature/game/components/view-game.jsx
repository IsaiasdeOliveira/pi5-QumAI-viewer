import { useGameContext } from '../context/game-context';
import { useGameSocket } from '../hooks/useGameSocket';
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';

export function ViewGame({ gameId }) {
  const { spectator } = useGameContext();
  const { connected, gameState } = useGameSocket(
    gameId,
    spectator?.[gameId]?.spectator_access_token || null
  );

  return (
    <div className={cn('flex flex-col gap-4 py-8', 'flex-1')}>
      <Typography
        variant={'h1'}
        asTag={'h1'}
        className={cn('text-2xl', 'font-bold')}
      >
        Assistindo jogo
      </Typography>
      <Typography
        variant={'p'}
        asTag={'p'}
        className={cn('text-lg', 'text-neutral-600')}
      >
        Assistindo: {gameId}
      </Typography>

      <div className={cn('flex', 'gap-2', 'items-center')}>
        <Typography
          variant={'span'}
          asTag={'span'}
          className={cn(
            'rounded-full',
            'bg-neutral-500',
            'text-white',
            'px-4 py-1',
            {
              'bg-yellow-600': !connected,
              'bg-green-500': connected,
            }
          )}
        >
          {!connected && 'Conectando...'}
          {connected && 'Conectado'}
        </Typography>

        {gameState?.status === 'PLAYING' && (
          <Typography
            variant={'span'}
            asTag={'span'}
            className={cn(
              'rounded-full',
              'bg-neutral-500',
              'text-white',
              'text-xs',
              'px-4 py-1'
            )}
          >
            Assistindo
          </Typography>
        )}
      </div>

      {connected && gameState && (
        <div className={cn('grid grid-cols-5  min-w-4xl max-w-4xl gap-4')}>
          {gameState?.board?.map((row, r) => {
            return row.map((cell, c) => {
              return (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'flex flex-col gap-2',
                    'items-start',
                    'h-40',
                    'bg-sky-300',
                    'p-4',
                    'rounded-xl',
                    {
                      'bg-sky-500': cell?.level === 1,
                      'bg-sky-600': cell?.level === 2,
                      'bg-sky-700': cell?.level === 3,
                      'bg-sky-800': cell?.level === 4,
                    }
                  )}
                >
                  <Typography
                    variant={'span'}
                    asTag={'span'}
                    className={cn(
                      'rounded-full',
                      'bg-neutral-500',
                      'text-white',
                      'text-xl font-bold',
                      'px-4 py-1'
                    )}
                  >
                    {cell?.level}
                  </Typography>
                  {cell?.professor && (
                    <Typography
                      variant={'span'}
                      asTag={'span'}
                      className={cn(
                        'rounded-full',
                        'bg-neutral-500',
                        'text-white',
                        'text-xs',
                        'px-4 py-1'
                      )}
                    >
                      {cell?.professor}
                    </Typography>
                  )}
                </div>
              );
            });
          })}
        </div>
      )}
    </div>
  );
}
