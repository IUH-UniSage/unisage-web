import { AdminProfile, ProfileLoader } from "@/features/profile"

export function ProfilePage() {
  return <ProfileLoader>{(me) => <AdminProfile me={me} />}</ProfileLoader>
}
