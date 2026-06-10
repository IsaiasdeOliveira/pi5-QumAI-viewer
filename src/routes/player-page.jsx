import { useGameContext } from '../feature/game/context/game-context';
import { PlayerRegisterForm } from '../feature/game/components/player-register-form';
import { PlayerUpdateForm } from '../feature/game/components/player-update-form';
import { Typography } from '@ui/text/typography';
import { cn } from '@core/helpers';
import { useState } from 'react';

export function PlayerPage() {
  const { player, setPlayer } = useGameContext();
  const [copied, setCopied] = useState(false);

  // ESTADO DO OLHINHO: Controla se o token aparece oculto ou visível na tela
  const [mostrarToken, setMostrarToken] = useState(false);

  // Função para copiar o token real para a área de transferência sem precisar revelá-lo
  function copiarTokenParaAreaDeTransferencia() {
    if (player?.player_access_token) {
      navigator.clipboard.writeText(player.player_access_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Função para desconectar o jogador atual
  function deslogarJogador() {
    setPlayer(null);
  }

  return (
    <div className="flex flex-col gap-6 py-6 w-full text-white flex-1 bg-zinc-950 px-4 animate-fade-in">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-1 border-b border-purple-500/10 pb-4 max-w-4xl mx-auto w-full">
        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
          Painel do Jogador de IA
        </span>
        <Typography
          variant={'h1'}
          asTag={'h1'}
          className="text-2xl font-black text-zinc-100 tracking-wide mt-0.5"
        >
          {player ? 'Seu Perfil ' : 'Registro de Jogador de IA'}
        </Typography>
      </div>

      {/* SE NÃO HOUVER JOGADOR SALVO, MOSTRA O FORMULÁRIO DE CADASTRO */}
      {!player ? (
        <div className="w-full py-4">
          <PlayerRegisterForm />
        </div>
      ) : (
        /* SE JÁ HOUVER JOGADOR, MOSTRA O CARD COMPACTO PREMIUM */
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full items-center">
          <div className="w-full bg-zinc-900 border border-purple-950 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-6 items-center md:items-start backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* AVATAR DO ROBÔ */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300" />
              <img
                src={
                  player?.ai_player_avatar ||
                  'https://api.dicebear.com/7.x/bottts/svg?seed=default'
                }
                alt="Avatar da IA"
                className="w-24 h-24 rounded-full object-cover relative bg-zinc-950 border border-zinc-800 p-1"
              />
            </div>

            {/* INFORMAÇÕES DO JOGADOR */}
            <div className="flex-1 flex flex-col gap-4 w-full text-center md:text-left">
              <div>
                <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {player?.group_name || 'Sem Grupo'}
                </span>
                <h2 className="text-xl font-black text-zinc-100 mt-1.5 tracking-wide">
                  {player?.ai_player_name || 'Professor de IA'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1 italic font-sans max-w-xl">
                  "
                  {player?.ai_player_description ||
                    'Nenhuma estratégia informada.'}
                  "
                </p>
              </div>

              {/* BLOCO CENTRAL: EXIBE O NÚMERO DO JOGADOR (ID NUMÉRICO) */}
              <div className="flex flex-col gap-2 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60 w-full md:max-w-xl font-mono text-xs">
                <div className="flex justify-between items-center border-b border-zinc-900/60 pb-2">
                  <span className="text-zinc-500 font-sans font-medium">
                    Número do Jogador (player_id):
                  </span>
                  <span className="text-green-400 font-black text-sm bg-green-500/5 border border-green-500/20 px-2 py-0.5 rounded">
                    {player?.id ? player.id : 'Não disponível'}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 pb-1">
                  <span className="text-zinc-500 font-sans font-medium">
                    Endpoint de Movimento:
                  </span>
                  <span
                    className="text-purple-300 truncate max-w-[220px] md:max-w-[340px]"
                    title={player?.ai_player_move_endpoint}
                  >
                    {player?.ai_player_move_endpoint}
                  </span>
                </div>
              </div>

              {/* CHAVE DE ACESSO PROTEGIDA — CORRIGIDA CONTRA AUTOCOMPLETE DO CHROME */}
              <div className="flex flex-col gap-1.5 w-full md:max-w-xl text-left">
                <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">
                  🔑 Chave de Acesso Oculta (Access Token)
                </label>
                <div className="flex gap-2 w-full">
                  {/* Container do input ocultável */}
                  <div className="relative flex-1 flex items-center">
                    <input
                      type={mostrarToken ? 'text' : 'password'}
                      readOnly
                      autoComplete="new-password" // CORREÇÃO: Impede o Chrome de autocompletar com senhas salvas
                      name="player_secret_access_token_field" // Nome aleatório para despistar o navegador
                      value={player?.player_access_token || ''}
                      // CORREÇÃO VISUAL: Estilos adicionados para remover o fundo amarelo/azul do autocomplete do Chrome
                      className="w-full bg-zinc-950 border border-zinc-800/80 rounded-lg pl-4 pr-10 py-2 text-xs font-mono text-purple-300 focus:outline-none tracking-wide transition-colors [&:-webkit-autofill]:[--tw-text-opacity:1] [&:-webkit-autofill]:[WebkitTextFillColor:#d8b4fe] [&:-webkit-autofill]:[WebkitBoxShadow:0_0_0_50px_#09090b_inset]"
                    />

                    {/* Botão Interativo do Olhinho */}
                    <button
                      type="button"
                      onClick={() => setMostrarToken(!mostrarToken)}
                      className="absolute right-3 text-zinc-500 hover:text-purple-400 transition-colors z-10"
                      title={mostrarToken ? 'Esconder Token' : 'Mostrar Token'}
                    >
                      {mostrarToken ? (
                        /* Ícone: Olho Aberto */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      ) : (
                        /* Ícone: Olho Fechado */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Botão de Copiar */}
                  <button
                    type="button"
                    onClick={copiarTokenParaAreaDeTransferencia}
                    className={cn(
                      'px-4 py-2 rounded-lg text-xs font-bold font-mono border transition-all duration-200 active:scale-95 whitespace-nowrap',
                      copied
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700/80 text-zinc-200'
                    )}
                  >
                    {copied ? '✓ Copiado!' : '📋 Copiar'}
                  </button>
                </div>
              </div>

              {/* RE-ATUALIZAR ENDPOINT E DISCONNECT */}
              <div className="flex flex-wrap gap-3 mt-2 justify-center md:justify-start w-full">
                <div className="w-full md:max-w-xl bg-zinc-950/20 p-4 rounded-xl border border-zinc-800/40">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide block mb-2 text-left">
                    🔄 Atualizar Rota da IA
                  </span>
                  <PlayerUpdateForm />
                </div>

                <button
                  type="button"
                  onClick={deslogarJogador}
                  className="mt-2 px-4 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold rounded-lg transition-all active:scale-95"
                >
                  🚪 Desconectar Jogador / Trocar de Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
