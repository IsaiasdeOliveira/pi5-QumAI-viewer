import { cn } from '@core/helpers';
import { listGames } from '@feature/game/api';
import { Typography } from '@ui/text/typography';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

export function HomePage() {
  const [partidas, setPartidas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para gerenciar a página atual
  const [page, setPage] = useState(1);

  // Estado para gerenciar o filtro de status (null = Todas, 'PLAYING' = Jogando, 'PAUSED' = Pausado, 'FINISHED' = Finalizadas)
  const [statusFiltro, setStatusFiltro] = useState(null);

  // 🔥 1. NOVO ESTADO: Guarda o texto que você digita para buscar o jogador
  const [busca, setBusca] = useState('');

  async function buscarPartidas() {
    try {
      // Montamos o objeto de busca padrão
      const dto = { page: page, page_size: 20 };

      // Se houver um filtro selecionado, adicionamos no envio da API
      if (statusFiltro) {
        dto.status = statusFiltro;
      }

      const response = await listGames(dto);
      setPartidas(response);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  // O atualizador agora observa se a página OU o filtro mudaram
  useEffect(() => {
    buscarPartidas();

    const atualizadorHome = setInterval(() => {
      buscarPartidas();
    }, 500);

    return () => clearInterval(atualizadorHome);
  }, [page, statusFiltro]);

  // Função auxiliar para mudar o filtro e resetar para a página 1
  function alterarFiltro(novoStatus) {
    setStatusFiltro(novoStatus);
    setPage(1);
  }

  // 🔥 2. LÓGICA DO FILTRO: Filtra as partidas pelo nome que você digitou
  const partidasFiltradas =
    partidas?.items?.filter((game) => {
      const termo = busca.toLowerCase().trim();

      // Se o campo de busca estiver vazio, mostra todas as partidas do servidor
      if (!termo) return true;

      // Pega o nome do time Turing e Lovelace (puxado exatamente da estrutura do seu card)
      const nomeTuring =
        game?.turing_player?.ai_player_name?.toLowerCase() || '';
      const nomeLovelace =
        game?.lovelace_player?.ai_player_name?.toLowerCase() || '';
      const matchId = game?.id?.toLowerCase() || '';

      // Retorna a partida se o termo digitado bater com o robô 1, robô 2 ou com o ID da partida
      return (
        nomeTuring.includes(termo) ||
        nomeLovelace.includes(termo) ||
        matchId.includes(termo)
      );
    }) || [];

  return (
    <div
      className={cn(
        'flex flex-col gap-6 py-8 px-4 bg-zinc-900/50 min-h-screen text-white flex-1'
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
          {partidasFiltradas.length} Partidas exibidas
        </span>
      </div>

      {/* Container dos Filtros (Botões + Barra de Busca lado a lado/empilhados) */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Painel de Botões de Filtro Estilizados */}
        <div className="flex flex-wrap gap-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/40 max-w-md w-full md:w-auto">
          <button
            onClick={() => alterarFiltro(null)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all border font-mono cursor-pointer',
              statusFiltro === null
                ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            )}
          >
            🔍 Todas
          </button>

          <button
            onClick={() => alterarFiltro('PLAYING')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all border font-mono cursor-pointer',
              statusFiltro === 'PLAYING'
                ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.2)] font-black'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-green-500/70'
            )}
          >
            ● Jogando
          </button>

          <button
            onClick={() => alterarFiltro('PAUSED')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all border font-mono cursor-pointer',
              statusFiltro === 'PAUSED'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-black'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-amber-500/70'
            )}
          >
            ⏸ Pausado
          </button>

          <button
            onClick={() => alterarFiltro('FINISHED')}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-bold transition-all border font-mono cursor-pointer',
              statusFiltro === 'FINISHED'
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-300'
            )}
          >
            🏁 Finalizadas
          </button>
        </div>

        {/* 🔥 3. NOVO INPUT VISUAL: Barra de pesquisa estilizada em sintonia com o tema neon */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="🔍 Filtrar por Jogador ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={cn(
              'w-full px-4 py-2 text-sm font-mono rounded-xl border transition-all duration-200 outline-none',
              'bg-zinc-950 border-zinc-800 text-zinc-200',
              'placeholder-zinc-500 focus:border-purple-500/60 focus:shadow-[0_0_12px_rgba(168,85,247,0.15)]'
            )}
          />
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-purple-400 font-medium animate-pulse">
          Carregando partidas do servidor...
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
        {/* 🔥 4. MUDANÇA AQUI: Agora fazemos o map na lista filtrada locais! */}
        {partidasFiltradas.map((game, g) => {
          const isFinished = game?.status === 'FINISHED';
          const isPlaying = game?.status === 'PLAYING';
          const isPaused = game?.status === 'PAUSED';

          const dataBruta = game?.started_at || game?.created_at;
          const dataFormatada = dataBruta
            ? new Date(dataBruta).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Horário Indefinido';

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
              {/* LADO ESQUERDO: Identificador, Tag de Status e Horário */}
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

                {/* Badge de Status Atualizada */}
                <span
                  className={cn(
                    'mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border',
                    isPlaying &&
                      'bg-green-500/10 text-green-400 border-green-500/30 animate-pulse',
                    isPaused &&
                      'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    isFinished && 'bg-zinc-800 text-zinc-400 border-zinc-700',
                    !isPlaying &&
                      !isPaused &&
                      !isFinished &&
                      'bg-zinc-800/50 text-zinc-500 border-zinc-800'
                  )}
                >
                  {isPlaying
                    ? '● JOGANDO'
                    : isPaused
                      ? '⏸ PAUSADO'
                      : game?.status}
                </span>

                <span className="text-[10px] text-zinc-400 font-mono mt-2 flex items-center gap-1 bg-zinc-950/40 px-2 py-0.5 rounded border border-zinc-800/40">
                  📅 {dataFormatada}
                </span>
              </div>

              {/* MEIO: Painel Versus */}
              <div className="flex items-center gap-6 my-2 md:my-0 bg-zinc-950/40 px-6 py-2 rounded-xl border border-zinc-800/60 relative">
                <span className="absolute -top-2 left-4 text-[8px] font-mono bg-purple-900/60 border border-purple-500/30 px-1 rounded text-purple-300 font-bold uppercase tracking-tight">
                  Criador da Sala
                </span>

                {/* Jogador Turing */}
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

                {/* Divisor "VS" */}
                <span className="text-xs font-black text-purple-500/60 italic font-mono bg-purple-500/5 px-2 py-1 rounded border border-purple-500/10">
                  VS
                </span>

                {/* Jogador Lovelace */}
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

              {/* LADO DIREITO: Botão de Ação */}
              <div className="w-full md:w-auto">
                <Link
                  to={
                    isFinished
                      ? `/game-details/${game.id}`
                      : `/spectate/${game.id}`
                  }
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

      {/* BOTÕES DE PAGINAÇÃO */}
      <div className="flex justify-center items-center gap-6 mt-8 border-t border-purple-500/10 pt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-5 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 disabled:opacity-30 transition-all font-bold cursor-pointer disabled:cursor-not-allowed"
        >
          &larr; Página Anterior
        </button>

        <span className="text-purple-400 font-mono font-bold bg-purple-900/20 px-4 py-2 rounded-md border border-purple-500/30">
          Página {page}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!partidas?.items || partidas.items.length < 20}
          className="px-5 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg hover:brightness-110 shadow-[0_4px_12px_rgba(168,85,247,0.3)] transition-all font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Próxima Página &rarr;
        </button>
      </div>
    </div>
  );
}
