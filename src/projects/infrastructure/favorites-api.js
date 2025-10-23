// Project Favorite API
// Handles HTTP requests for favorite-related operations
import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

export class FavoritesApi extends BaseEndpoint {
  constructor() {
    const baseApi = new BaseApi();
    super(baseApi, "/favorites");
  }

  /**
   * Get all favorites for a profile
   * @param {string} profileId
   */
  getFavoritesByProfile(profileId) {
    return this.http.get(`${this.endpointPath}?profileId=${profileId}&_expand=project`);
  }

  /**
   * Add a favorite (profileId, projectId)
   */
  addFavorite(profileId, projectId) {
    return this.http.post(`${this.endpointPath}`, { profileId, projectId });
  }

  /**
   * Remove a favorite (profileId, projectId)
   */
  removeFavorite(id) {
    return this.http.delete(`${this.endpointPath}/${id}`);
  }
}
