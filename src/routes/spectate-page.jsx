import { cn } from '@core/helpers';
import { SpectateGame } from '@feature/game/components/spectate-game';
import { Typography } from '@ui/text/typography';
import { useParams } from 'react-router';

export function SpectatePage() {
  const { gameId } = useParams();
  return (
    <div className={cn('flex flex-col gap-4 py-8', 'flex-1')}>
      <Typography
        variant={'h1'}
        asTag={'h1'}
        className={cn('text-4xl', 'font-bold')}
      >
        Assistindo #{gameId}
      </Typography>
      <SpectateGame gameId={gameId} />
    </div>
  );
}
