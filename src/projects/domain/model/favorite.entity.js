// Favorite Entity
// Represents a favorite relationship between a profile and a project
export class Favorite {
  constructor({
    id = null,
    profileId = null, // profile.id
    projectId = null, // project.id
    createdAt = null
  } = {}) {
    this.id = id;
    this.profileId = profileId;
    this.projectId = projectId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
  }
}
