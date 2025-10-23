// Comment Assembler
import { Comment } from '../domain/model/comment.entity.js';

export class CommentAssembler {
  static fromApiToEntity(apiObj) {
    return new Comment({
      id: apiObj.id,
      profileId: apiObj.profileId,
      userId: apiObj.userId,
      rating: apiObj.rating,
      comment: apiObj.comment,
      createdAt: apiObj.createdAt
    });
  }

  static fromApiArrayToEntityArray(apiArr) {
    return apiArr.map(this.fromApiToEntity);
  }

  static fromEntityToApi(entity) {
    return {
      id: entity.id,
      profileId: entity.profileId,
      userId: entity.userId,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt
    };
  }
}
