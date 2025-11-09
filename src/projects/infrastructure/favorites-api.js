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
        return this.http.get(`${this.endpointPath}/profile/${profileId}`);
    }

    /**
     * Get favorite projects for a profile
     * @param {string} profileId
     */
    getFavoriteProjectsByProfile(profileId) {
        return this.http.get(`${this.endpointPath}/profile/${profileId}/projects`);
    }

    /**
     * Check if project is favorite
     * @param {string} profileId
     * @param {string} projectId
     */
    checkIfFavorite(profileId, projectId) {
        return this.http.get(`${this.endpointPath}/profile/${profileId}/check/${projectId}`);
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
    removeFavorite(profileId, projectId) {
        return this.http.delete(`${this.endpointPath}/profile/${profileId}/project/${projectId}`);
    }
}