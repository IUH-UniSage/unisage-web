import { useMutation, useQueryClient } from "@tanstack/react-query"

import { systemConfigApi } from "@/features/system-settings/api/system-config-api"
import { systemConfigKeys } from "@/features/system-settings/queries/keys"
import type { SystemConfig } from "@/features/system-settings/schemas/system-config-schemas"
import type { UpdateSystemConfigRequest } from "@/features/system-settings/schemas/system-config-schemas"

type UpdateSystemConfigVariables = {
  configKey: string
  input: UpdateSystemConfigRequest
}

// No `meta.successMessage` here on purpose: a tab save can touch several
// keys at once (one PUT per changed key, fired in parallel - see
// category-config-form.tsx), and one toast per key would spam the user. The
// form shows one aggregate toast for the whole save instead, plus inline
// per-field errors for whichever keys failed. `suppressGlobalError` mutes
// the default per-mutation error toast for the same reason.
export function useUpdateSystemConfigMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    meta: {
      invalidatesQuery: systemConfigKeys.list(),
      suppressGlobalError: true,
    },
    mutationFn: ({ configKey, input }: UpdateSystemConfigVariables) =>
      systemConfigApi.updateSystemConfig(configKey, input),
    onSuccess: (updatedConfig) => {
      queryClient.setQueryData(
        systemConfigKeys.list(),
        (current: SystemConfig[] | undefined) =>
          current?.map((config) =>
            config.configKey === updatedConfig.configKey
              ? updatedConfig
              : config
          )
      )
    },
  })
}
