import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';

export function ViewGameDetails({ gameData }) {
  // Se não houver dados, exibe um estado vazio discreto
  if (!gameData)
    return (
      <div className="text-purple-400 animate-pulse text-center p-8">
        Carregando histórico...
      </div>
    );

  // Identifica quem é o vencedor baseado no ID
  const isTuringWinner =
    gameData.winner_player_id === gameData.turing_player?.id;
  const winner = isTuringWinner
    ? gameData.turing_player
    : gameData.lovelace_player;
  const loser = isTuringWinner
    ? gameData.lovelace_player
    : gameData.turing_player;

  // Formatação simples de duração da partida
  const inicio = new Date(gameData.started_at);
  const fim = new Date(gameData.finished_at);
  const duracaoSegundos = Math.round((fim - inicio) / 1000);

  return (
    <div
      className={cn(
        'flex flex-col gap-6 py-8 px-4 bg-zinc-950 min-h-screen text-white flex-1'
      )}
    >
      {/* 1. PAINEL DO VENCEDOR (CROWN) */}
      <div className="bg-gradient-to-r from-purple-950/40 via-fuchsia-900/30 to-purple-950/40 border border-amber-500/40 p-6 rounded-2xl text-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
        <span className="text-amber-400 font-bold tracking-widest text-xs uppercase block mb-1">
          🏆 Professor Campeão
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
        <p className="text-xs text-purple-300 italic mt-2">
          &ldquo;{winner?.ai_player_description || 'Formou o aluno primeiro!'}
          &rdquo;
        </p>
      </div>

      {/* 2. PLACAR TÁTICO & METADADOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card do Time Turing */}
        <div
          className={cn(
            'p-4 rounded-xl bg-zinc-900/60 border',
            isTuringWinner ? 'border-purple-500/30' : 'border-zinc-800'
          )}
        >
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-2">
            Equipe Turing
          </span>
          <p className="text-sm font-bold truncate">
            {gameData.turing_player?.ai_player_name}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-center font-mono text-xs">
            <div className="bg-zinc-950 p-2 rounded">
              <span className="text-zinc-500 block text-[10px]">Vitórias</span>
              <span className="text-green-400 font-bold">
                {gameData.turing_player?.games_won}
              </span>
            </div>
            <div className="bg-zinc-950 p-2 rounded">
              <span className="text-zinc-500 block text-[10px]">Derrotas</span>
              <span className="text-red-400 font-bold">
                {gameData.turing_player?.games_lost}
              </span>
            </div>
          </div>
        </div>

        {/* Informações Gerais do Turno */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between items-center text-center font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Total de Turnos
            </span>
            <span className="text-3xl font-black text-fuchsia-400">
              {gameData.current_turn_number}
            </span>
          </div>
          <div className="w-full border-t border-zinc-800/80 pt-2 mt-2 grid grid-cols-2 text-[11px] text-zinc-400">
            <div>⏱️ {duracaoSegundos}s de aula</div>
            <div>👥 {gameData.spectators?.length || 0} Assistindo</div>
          </div>
        </div>

        {/* Card do Time Lovelace */}
        <div
          className={cn(
            'p-4 rounded-xl bg-zinc-900/60 border',
            !isTuringWinner ? 'border-purple-500/30' : 'border-zinc-800'
          )}
        >
          <span className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider block mb-2">
            Equipe Lovelace
          </span>
          <p className="text-sm font-bold truncate">
            {gameData.lovelace_player?.ai_player_name}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-center font-mono text-xs">
            <div className="bg-zinc-950 p-2 rounded">
              <span className="text-zinc-500 block text-[10px]">Vitórias</span>
              <span className="text-green-400 font-bold">
                {gameData.lovelace_player?.games_won}
              </span>
            </div>
            <div className="bg-zinc-950 p-2 rounded">
              <span className="text-zinc-500 block text-[10px]">Derrotas</span>
              <span className="text-red-400 font-bold">
                {gameData.lovelace_player?.games_lost}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RETRATO FINAL DO TABULEIRO (FOTO DE ENCERRAMENTO) */}
      <div className="flex flex-col gap-2">
        <Typography
          variant={'h4'}
          asTag={'h4'}
          className="text-sm font-bold uppercase tracking-wider text-purple-400 font-mono"
        >
          📋 Estado Final das Turmas (Escola)
        </Typography>

        <div className="grid grid-cols-5 min-w-4xl max-w-4xl gap-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
          {gameData.board?.map((row, r) => {
            return row.map((cell, c) => {
              const isLevel4 = cell?.level === 4;
              const hasProfessor = !!cell?.professor;

              return (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'flex flex-col gap-2 items-start justify-between h-28 p-3 rounded-xl transition-all border',
                    'bg-zinc-950/80 border-zinc-800',
                    {
                      'border-purple-500/30 bg-purple-950/10':
                        cell?.level === 1,
                      'border-purple-500/50 bg-purple-950/20':
                        cell?.level === 2,
                      'border-fuchsia-500/50 bg-fuchsia-950/30':
                        cell?.level === 3,
                      'border-amber-500 bg-amber-500/10 shadow-[inset_0_0_10px_rgba(245,158,11,0.2)]':
                        isLevel4,
                    }
                  )}
                >
                  {/* Selo do Ano Letivo (Nível) */}
                  <span
                    className={cn(
                      'rounded-md text-[11px] font-bold px-2 py-0.5 font-mono',
                      isLevel4
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    )}
                  >
                    {isLevel4 ? '🎓 Formado' : `${cell?.level}º Ano`}
                  </span>

                  {/* Nome do Professor Regente */}
                  {hasProfessor ? (
                    <span
                      className={cn(
                        'text-[11px] font-bold tracking-wide truncate w-full px-2 py-1 rounded bg-zinc-900 text-purple-300 border border-purple-500/10'
                      )}
                    >
                      👨‍🏫 {cell?.professor}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-600 italic font-mono">
                      Sem Professor
                    </span>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
