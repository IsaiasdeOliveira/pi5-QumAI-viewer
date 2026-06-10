import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { getGame } from '@feature/game/api'; // Importando a função existente da sua API
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';

export function GameDetailsPage() {
  const { gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function carregarDetalhes() {
      try {
        setLoading(true);
        // Consome a função da sua API passando o ID da URL
        const data = await getGame(gameId);
        setGameData(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erro ao carregar os dados do relatório.');
      } finally {
        setLoading(false);
      }
    }
    if (gameId) carregarDetalhes();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-purple-400 font-medium animate-pulse">
        Carregando histórico da secretaria...
      </div>
    );
  }

  if (error || !gameData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl max-w-md text-center">
          <h3 className="font-bold text-lg mb-2">Erro ao acessar registros</h3>
          <p className="text-sm text-zinc-400 mb-4">{error}</p>
          <Link
            to="/"
            className="px-4 py-2 bg-zinc-900 rounded-lg text-sm border border-zinc-800 hover:bg-zinc-800"
          >
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  const isTuringWinner =
    gameData.winner_player_id === gameData.turing_player?.id;
  const winner = isTuringWinner
    ? gameData.turing_player
    : gameData.lovelace_player;

  const inicio = new Date(gameData.started_at);
  const fim = new Date(gameData.finished_at);
  const duracaoSegundos = Math.round((fim - inicio) / 1000);

  return (
    <div
      className={cn(
        'flex flex-col gap-6 py-8 px-6 bg-zinc-950 min-h-screen text-white flex-1'
      )}
    >
      <div>
        <Link
          to="/"
          className="text-xs text-purple-400 hover:text-purple-300 font-mono"
        >
          ← Voltar para a Arena de Partidas.
        </Link>
      </div>

      {/* 1. PAINEL DO VENCEDOR */}
      <div className="bg-gradient-to-r from-purple-950/40 via-fuchsia-900/30 to-purple-950/40 border border-amber-500/40 p-6 rounded-2xl text-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <span className="text-amber-400 font-bold tracking-widest text-xs uppercase block mb-1">
          🏆 Jogador Campeão (Formou Primeiro!)
        </span>
        <div className="flex justify-center items-center gap-4 my-2">
          <img
            src={
              winner?.ai_player_avatar ||
              'https://api.dicebear.com/7.x/bottts/svg?seed=winner'
            }
            alt="Winner"
            className="w-16 h-16 rounded-full border-2 border-amber-400 p-0.5 bg-zinc-900 object-cover"
          />
          <div className="text-left">
            <Typography
              variant={'h2'}
              asTag={'h2'}
              className="text-2xl font-black text-amber-300"
            >
              {winner?.ai_player_name}
            </Typography>
            <p className="text-xs text-zinc-400 font-mono">
              Grupo: {winner?.group_name}
            </p>
          </div>
        </div>
        {winner?.ai_player_description && (
          <p className="text-xs text-purple-300 italic mt-2">
            &ldquo;{winner?.ai_player_description}&rdquo;
          </p>
        )}
      </div>

      {/* 2. PLACAR TÁTICO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Turing */}
        <div
          className={cn(
            'p-4 rounded-xl bg-zinc-900/60 border',
            isTuringWinner
              ? 'border-purple-500/40 bg-purple-950/5'
              : 'border-zinc-800'
          )}
        >
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">
            Equipe Turing
          </span>
          <p className="text-sm font-bold truncate">
            {gameData.turing_player?.ai_player_name || 'Turing Bot'}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-center font-mono text-xs">
            <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
              <span className="text-zinc-500 block text-[9px]">Vitórias</span>
              <span className="text-green-400 font-bold">
                {gameData.turing_player?.games_won ?? 0}
              </span>
            </div>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
              <span className="text-zinc-500 block text-[9px]">Derrotas</span>
              <span className="text-red-400 font-bold">
                {gameData.turing_player?.games_lost ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Metadados */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between items-center text-center font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Total de Turnos Letivos
            </span>
            <span className="text-3xl font-black text-fuchsia-400">
              {gameData.current_turn_number}
            </span>
          </div>
          <div className="w-full border-t border-zinc-800/60 pt-2 mt-2 grid grid-cols-2 text-[10px] text-zinc-400">
            <div>⏱️ {duracaoSegundos || 0}s de Aula</div>
            <div>👥 {gameData.spectators?.length || 0} Espectadores</div>
          </div>
        </div>

        {/* Time Lovelace */}
        <div
          className={cn(
            'p-4 rounded-xl bg-zinc-900/60 border',
            !isTuringWinner
              ? 'border-fuchsia-500/40 bg-fuchsia-950/5'
              : 'border-zinc-800'
          )}
        >
          <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider block mb-1">
            Equipe Lovelace
          </span>
          <p className="text-sm font-bold truncate">
            {gameData.lovelace_player?.ai_player_name || 'Lovelace Bot'}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-center font-mono text-xs">
            <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
              <span className="text-zinc-500 block text-[9px]">Vitórias</span>
              <span className="text-green-400 font-bold">
                {gameData.lovelace_player?.games_won ?? 0}
              </span>
            </div>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
              <span className="text-zinc-500 block text-[9px]">Derrotas</span>
              <span className="text-red-400 font-bold">
                {gameData.lovelace_player?.games_lost ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RETRATO FINAL DO TABULEIRO */}
      <div className="flex flex-col gap-3 mt-2">
        <Typography
          variant={'h4'}
          asTag={'h4'}
          className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono"
        >
          Estado de Encerramento da Partida
        </Typography>

        <div className="grid grid-cols-5 gap-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/60 max-w-3xl">
          {gameData.board?.map((row, r) =>
            row.map((cell, c) => {
              const isLevel4 = cell?.level === 4;
              const hasProfessor = !!cell?.professor;

              return (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'flex flex-col gap-2 items-center justify-center h-24 p-2 rounded-xl border transition-all',
                    'bg-zinc-950/80 border-zinc-800/80',
                    {
                      'border-purple-500/20 bg-purple-950/5': cell?.level === 1,
                      'border-purple-500/40 bg-purple-950/10':
                        cell?.level === 2,
                      'border-fuchsia-500/40 bg-fuchsia-950/20':
                        cell?.level === 3,
                      'border-amber-500 bg-amber-500/10 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]':
                        isLevel4,
                    }
                  )}
                >
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded font-mono',
                      isLevel4
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400'
                    )}
                  >
                    {isLevel4 ? '🎓 Formado' : `${cell?.level}º Ano`}
                  </span>

                  {hasProfessor ? (
                    <span className="text-[10px] font-bold truncate max-w-full text-purple-300 bg-zinc-900 px-1 rounded border border-purple-500/10">
                      👨‍🏫 {cell?.professor}
                    </span>
                  ) : (
                    <span className="text-[9px] text-zinc-700 font-mono italic">
                      Vazia
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
