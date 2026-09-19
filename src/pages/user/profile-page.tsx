import { ProfileLoader, UserProfile } from "@/features/profile"

export function ProfilePage() {
  return <ProfileLoader>{(me) => <UserProfile me={me} />}</ProfileLoader>
}
