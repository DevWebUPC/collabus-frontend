// Comment Entity
export class Comment {
  constructor({ id, profileId, userId, rating, comment, createdAt }) {
    this.id = id;
    this.profileId = profileId; // Profile being commented
    this.userId = userId; // User who commented
    this.rating = rating;
    this.comment = comment;
    this.createdAt = createdAt || new Date().toISOString();
  }
}
