import { Outlet } from 'react-router';
import { RootMenu } from './root-menu';
import { Container } from '@ui/layout/container';
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';

export function RootLayout() {
  return (
    <div
      className={cn(
        'w-dvw min-h-dvh',
        'flex flex-col gap-0',
        'bg-zinc-900/50 text-white antialiased'
      )}
    >
      <header
        id={'site-header'}
        className={cn(
          'bg-zinc-800/90 border-b border-purple-500/10 backdrop-blur-md'
        )}
      >
        <Container className={cn('p-4 flex items-center justify-between')}>
          <div className="flex items-center gap-3">
            <Typography
              variant={'h1'}
              asTag={'h1'}
              className="text-2xl font-black tracking-widest bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent uppercase font-mono"
            >
              Quma AI
            </Typography>
            {/* Badge do projeto */}
            <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-mono font-bold tracking-wider">
              PI5
            </span>
          </div>
        </Container>
      </header>

      {/* O menu de navegação herda o contexto escuro do pai */}
      <RootMenu />

      {/* MAIN: Garantimos que o fundo das páginas internas também seja escuro */}
      <main
        id={'site-main'}
        className={cn('flex-1', 'flex flex-col bg-zinc-800/90')}
      >
        <Container className={cn('px-4 py-6', 'flex-1 flex flex-col')}>
          <Outlet />
        </Container>
      </main>

      {/* FOOTER: Combinando com o resto da arena */}
      <footer
        id={'site-footer'}
        className={cn('bg-neutral-700 border-t border-zinc-900', 'text-white')}
      >
        <Container className={cn('p-4')}>
          <Typography
            variant={'p'}
            asTag={'p'}
            className={cn('text-xs', 'font-bold', 'text-zinc-600 font-mono')}
          >
            &copy; 2026 Quma AI &bull; PI5
          </Typography>
        </Container>
      </footer>
    </div>
  );
}
