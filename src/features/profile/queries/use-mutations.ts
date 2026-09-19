import { useMutation } from "@tanstack/react-query"

import { profileApi } from "@/features/profile/api/profile-api"

export function useChangePasswordMutation() {
  return useMutation({
    meta: {
      successMessage: "Đã đổi mật khẩu.",
      // The dialog shows the backend message (e.g. wrong current password) inline.
      suppressGlobalError: true,
    },
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(input),
  })
}
