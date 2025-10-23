// Favorite Assembler
// Transforms data between API and Favorite entity
import { Favorite } from '../domain/model/favorite.entity.js';

export class FavoriteAssembler {
  static fromApiToEntity(apiData) {
    if (!apiData) return null;
    return new Favorite({
      id: apiData.id,
      profileId: apiData.profileId,
      projectId: apiData.projectId,
      createdAt: apiData.createdAt
    });
  }

  static fromApiArrayToEntityArray(apiDataArray) {
    if (!Array.isArray(apiDataArray)) return [];
    return apiDataArray.map(this.fromApiToEntity);
  }
}
