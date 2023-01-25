export const displayName = (profile) =>
  profile.nickname || profile.firstName || (profile.lastName && `Mx ${profile.lastName}`)
