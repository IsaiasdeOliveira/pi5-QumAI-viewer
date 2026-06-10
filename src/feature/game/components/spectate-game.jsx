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
    <div className="w-full max-w-7xl mx-auto mt-6 animate-fade-in">
      {!spectator && (
        <div className="bg-zinc-900 border border-purple-950/60 p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col gap-6">
          {/* Luz de fundo decorativa */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* Cabeçalho da Ficha */}
          <div className="flex flex-col gap-2 border-b border-purple-500/10 pb-6">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
              Painel de Transmissão Restrito
            </span>
            <Typography
              variant={'h3'}
              className="text-3xl font-black text-zinc-100 tracking-wide mt-1"
            >
              Homologação de Espectador
            </Typography>
          </div>

          <Typography
            variant={'p'}
            className="text-sm md:text-base text-zinc-400 leading-relaxed font-sans max-w-2xl"
          >
            Para assistir a esta partida tática em tempo real, você precisa se
            registrar como espectador da partida. O formulário abaixo gerará seu
            token de acesso criptografado de transmissão.
          </Typography>

          {/* Container do formulário com Hack de CSS para herdar as cores e focar em TAMANHOS MAIORES */}
          <div className="mt-4 text-zinc-200 styled-spectator-form w-full max-w-3xl">
            <SpectatorRegisterForm gameId={gameId} />
          </div>

          {/* INJEÇÃO DE CLASSE: Ajustada com fontes e espaçamentos MUITO MAIORES */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .styled-spectator-form button {
              width: 100% !important;
              background: linear-gradient(to right, #9333ea, #c026d3) !important;
              color: white !important;
              font-weight: 800 !important;
              font-family: monospace !important;
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important;
              padding: 1rem 1.5rem !important;
              border-radius: 0.75rem !important;
              border: none !important;
              cursor: pointer !important;
              transition: all 0.2s !important;
              font-size: 16px !important;
              box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2) !important;
              margin-top: 1.5rem !important;
            }
            .styled-spectator-form button:hover {
              filter: brightness(1.1) !important;
              box-shadow: 0 6px 24px rgba(168, 85, 247, 0.4) !important;
              transform: translateY(-2px) !important;
            }
            .styled-spectator-form input, .styled-spectator-form select {
              width: 100% !important;
              background-color: #09090b !important;
              border: 2px solid #27272a !important;
              color: #e4e4e7 !important;
              border-radius: 0.5rem !important;
              padding: 0.75rem 1rem !important;
              font-family: monospace !important;
              font-size: 16px !important;
              outline: none !important;
              transition: all 0.2s !important;
              margin-bottom: 1rem !important;
            }
            .styled-spectator-form input:focus {
              border-color: #a855f7 !important;
              box-shadow: 0 0 15px rgba(168, 85, 247, 0.15) !important;
            }
            .styled-spectator-form label {
              color: #a1a1aa !important;
              font-size: 13px !important;
              font-family: monospace !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important;
              margin-bottom: 0.5rem !important;
              display: block !important;
            }
          `,
            }}
          />
        </div>
      )}
      {spectator && <ViewGame gameId={gameId} />}
    </div>
  );
}
