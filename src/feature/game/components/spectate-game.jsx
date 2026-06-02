import { useGameContext } from '../context/game-context';
import { Typography } from '@ui/text/typography';
import { SpectatorRegisterForm } from './spectator-register-form';
import { useEffect, useState } from 'react';
import { ViewGame } from './view-game';

export function SpectateGame({ gameId }) {
  const { spectator: storedSpectator } = useGameContext();

  const [spectator, setSpectator] = useState(() => {
    if (storedSpectator?.[gameId]) {
      return storedSpectator?.[gameId];
    }
    return null;
  });

  useEffect(() => {
    if (storedSpectator?.[gameId]) {
      setSpectator(storedSpectator?.[gameId]);
    }
  }, [storedSpectator]);

  return (
    <>
      {!spectator && (
        <>
          <Typography variant={'h3'}> Registro de Espectador</Typography>
          <Typography variant={'p'}>
            Para assistir a um jogo, você precisa se registrar como espectador.
            Por favor, preencha o formulário abaixo para obter seu token de
            acesso de espectador.
          </Typography>

          <SpectatorRegisterForm gameId={gameId} />
        </>
      )}
      {spectator && <ViewGame gameId={gameId} />}
    </>
  );
}
