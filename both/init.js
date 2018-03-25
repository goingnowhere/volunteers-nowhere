// volunteers module global
export const Volunteers = new VolunteersClass('nowhere2018')
const roles = ['manager','user']
// this is exported to handle the publication of the ProfilePictures
export const MeteorProfile = new MeteorProfileClass(Volunteers.eventName,roles)
