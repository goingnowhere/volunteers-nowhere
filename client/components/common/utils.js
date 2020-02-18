export const displayName = (profile) =>
  profile.nickname || profile.firstName || `Mx ${profile.lastName}`
