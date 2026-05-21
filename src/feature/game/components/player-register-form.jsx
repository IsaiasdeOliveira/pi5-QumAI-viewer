import { Controller, useForm } from 'react-hook-form';
import { registerPlayer } from '../api';
import { cn } from '@core/helpers';
import { useGameContext } from '../context/game-context';
import { useEffect, useState } from 'react';

export function PlayerRegisterForm() {
  const { player, setPlayer } = useGameContext();
  // Estado para alternar entre Registro e Entrada por Token
  const [isUsingToken, setIsUsingToken] = useState(false);

  const form = useForm({
    defaultValues: {
      ai_player_name: player?.ai_player_name || 'Meu Jogador',
      ai_player_avatar:
        player?.ai_player_avatar || 'https://example.com/avatar.png',
      group_name: player?.group_name || 'Meu Grupo',
      ai_player_description:
        player?.ai_player_description || 'Descrição do meu jogador de IA',
      ai_player_move_endpoint:
        player?.ai_player_move_endpoint || 'https://example.com/move-endpoint',
      existing_token: '',
    },
  });
  const { formState } = form;
  const { isSubmitting, errors } = formState;

  async function handleSubmit(dto) {
    try {
      if (isUsingToken) {
        // Como o backend não tem rota de busca, injetamos as informações "na mão" no contexto.
        // Assim, o cabeçalho, a descrição, a tela de Update e as partidas funcionam perfeitamente!
        setPlayer({
          player_access_token: dto.existing_token,
          ai_player_name: dto.ai_player_name,
          ai_player_avatar: dto.ai_player_avatar,
          group_name: dto.group_name,
          ai_player_description: dto.ai_player_description,
          ai_player_move_endpoint: dto.ai_player_move_endpoint,
          // Geramos um ID temporário baseado no token caso o componente de Update precise de player.id
          id: player?.id || dto.existing_token.slice(0, 8),
        });
        return;
      }

      // Fluxo original de criação/registro
      const response = await registerPlayer({ ...dto });

      if (!response?.player_access_token) {
        throw new Error('[ERR]: resposta inesperada ao registrar jogador');
      }

      setPlayer(response);

      form?.reset({
        ai_player_name: response?.ai_player_avatar,
        ai_player_avatar: response?.ai_player_avatar,
        group_name: response?.group_name,
        ai_player_description: response?.ai_player_description,
        ai_player_move_endpoint: response?.ai_player_move_endpoint,
        existing_token: '',
      });
    } catch (err) {
      console.error(
        err?.message || '[ERR]: erro ao processar dados do jogador',
        err
      );
    }
  }

  useEffect(() => {
    if (player?.id) {
      form.reset({
        ai_player_name: player?.ai_player_name || 'Meu Jogador',
        ai_player_avatar:
          player?.ai_player_avatar || 'https://example.com/avatar.png',
        group_name: player?.group_name || 'Meu Grupo',
        ai_player_description:
          player?.ai_player_description || 'Descrição do meu jogador de IA',
        ai_player_move_endpoint:
          player?.ai_player_move_endpoint ||
          'https://example.com/move-endpoint',
        existing_token: '',
      });
    }
  }, [player]);

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('flex flex-col gap-2')}
      >
        {!isUsingToken ? (
          /* FORMULÁRIO PADRÃO: CADASTRO COMPLETO */
          <>
            <Controller
              name={'group_name'}
              control={form.control}
              rules={{ required: 'O nome do grupo é obrigatório' }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">Nome do grupo</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                  {errors.group_name && (
                    <span className={cn('text-red-500 text-xs')}>
                      {errors.group_name.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name={'ai_player_name'}
              control={form.control}
              rules={{ required: 'O nome do jogador de IA é obrigatório' }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">Nome do jogador</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                  {errors.ai_player_name && (
                    <span className={cn('text-red-500 text-xs')}>
                      {errors.ai_player_name.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name={'ai_player_avatar'}
              control={form.control}
              rules={{
                required: 'A URL do avatar do jogador de IA é obrigatória',
              }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">URL do avatar</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                  {errors.ai_player_avatar && (
                    <span className={cn('text-red-500 text-xs')}>
                      {errors.ai_player_avatar.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name={'ai_player_description'}
              control={form.control}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">Descrição do jogador</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                  {errors.ai_player_description && (
                    <span className={cn('text-red-500 text-xs')}>
                      {errors.ai_player_description.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name={'ai_player_move_endpoint'}
              control={form.control}
              rules={{
                required:
                  'O endpoint de movimento do jogador de IA é obrigatório',
              }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">
                    Endpoint de movimento do jogador
                  </label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                  {errors.ai_player_move_endpoint && (
                    <span className={cn('text-red-500 text-xs')}>
                      {errors.ai_player_move_endpoint.message}
                    </span>
                  )}
                </div>
              )}
            />

            <button
              type={'submit'}
              disabled={isSubmitting}
              className={cn(
                'mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Jogador'}
            </button>

            <button
              type="button"
              onClick={() => setIsUsingToken(true)}
              className="text-xs text-neutral-500 hover:text-green-600 text-center mt-3 underline focus:outline-none"
            >
              Tem um jogador criado? Entre com o token
            </button>
          </>
        ) : (
          /* ABA DO TOKEN: ENTRAR PASSANDO AS INFORMAÇÕES NA MÃO (PRO TIME ACESSAR) */
          <>
            <Controller
              name={'existing_token'}
              control={form.control}
              rules={{ required: 'O token de acesso é obrigatório' }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs font-semibold">
                    Token de Acesso Existente
                  </label>
                  <input
                    className={cn(
                      'border rounded-sm px-4 py-2 font-mono text-sm'
                    )}
                    type={'text'}
                    placeholder="Cole o player_access_token aqui"
                    {...field}
                  />
                  {errors.existing_token && (
                    <span className={cn('text-red-500 text-xs')}>
                      {errors.existing_token.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name={'group_name'}
              control={form.control}
              rules={{ required: 'O nome do grupo é obrigatório' }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">Nome do grupo</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                </div>
              )}
            />

            <Controller
              name={'ai_player_name'}
              control={form.control}
              rules={{ required: 'O nome do jogador é obrigatório' }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">Nome do jogador</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                </div>
              )}
            />

            <Controller
              name={'ai_player_avatar'}
              control={form.control}
              rules={{ required: 'A URL do avatar é obrigatória' }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">URL do avatar</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                </div>
              )}
            />

            <Controller
              name={'ai_player_description'}
              control={form.control}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">Descrição do jogador</label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                </div>
              )}
            />

            <Controller
              name={'ai_player_move_endpoint'}
              control={form.control}
              rules={{ required: 'O endpoint de movimento é obrigatório' }}
              render={({ field }) => (
                <div className={cn('flex flex-col gap-1')}>
                  <label className="text-xs">
                    Endpoint de movimento do jogador
                  </label>
                  <input
                    className={cn('border rounded-sm px-4 py-2')}
                    type={'text'}
                    {...field}
                  />
                </div>
              )}
            />

            <button
              type={'submit'}
              disabled={isSubmitting}
              className={cn(
                'mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              Entrar com Token
            </button>

            <button
              type="button"
              onClick={() => setIsUsingToken(false)}
              className="text-xs text-neutral-500 hover:text-green-600 text-center mt-3 underline focus:outline-none"
            >
              Voltar para o Registro de Novo Jogador
            </button>
          </>
        )}
      </form>
    </div>
  );
}
