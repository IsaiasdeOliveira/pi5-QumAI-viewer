import { cn } from '@core/helpers';
import { useGameContext } from '@feature/game/context/game-context';
import { Container } from '@ui/layout/container';
import { Link, useNavigate, useResolvedPath } from 'react-router';

export function RootMenu() {
  const { player, logout } = useGameContext();
  const navigate = useNavigate();
  const resolvedPath = useResolvedPath();

  return (
    <div className={cn('bg-neutral-700 text-white')}>
      <Container>
        <nav id={'root-menu'} className={cn('flex flex-row gap-4')}>
          <Link
            to={'/'}
            className={cn(
              'text-lg',
              'p-2 px-4',
              'hover:bg-neutral-500',
              'transition-all',
              {
                'bg-neutral-500': resolvedPath.pathname === '/',
              }
            )}
          >
            Home
          </Link>
          <Link
            to={'/about'}
            className={cn(
              'text-lg',
              'p-2 px-4',
              'hover:bg-neutral-500',
              'transition-all',
              {
                'bg-neutral-500': resolvedPath.pathname.startsWith('/about'),
              }
            )}
          >
            Sobre
          </Link>
          <Link
            to={'/player'}
            className={cn(
              'text-lg',
              'p-2 px-4',
              'hover:bg-neutral-500',
              'transition-all',
              {
                'bg-neutral-500': resolvedPath.pathname.startsWith('/player'),
              }
            )}
          >
            Jogador
          </Link>

          {player && (
            <button
              type="button"
              className={cn(
                'px-4 py-1.5',
                'bg-zinc-950/80',
                'border border-red-500/20',
                'text-red-400',
                'hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300',
                'rounded-lg',
                'text-xs font-mono font-bold',
                'transition-all duration-200',
                'shadow-[0_0_10px_rgba(239,68,68,0.05)]',
                'active:scale-95',
                'flex items-center gap-2',
                'ml-auto' // Mantém o botão alinhado à direita no seu menu
              )}
              onClick={() => {
                logout();
                navigate('/', {
                  replace: true,
                });
              }}
            >
              🚪 Sair{' '}
              <span className="opacity-60 text-[10px]">
                ({player.ai_player_name})
              </span>
            </button>
          )}
        </nav>
      </Container>
    </div>
  );
}
