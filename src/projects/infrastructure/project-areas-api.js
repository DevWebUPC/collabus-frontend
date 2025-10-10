import { BaseApi } from "../../shared/infrastructure/base-api.js";

/**
 * Project Areas API
 * Handles API calls for project areas/categories
 */
export class ProjectAreasApi extends BaseApi {
  constructor() {
    super();
    this.resourcePath = "/projectAreas";
  }

  /**
   * Get all active project areas
   * @returns {Promise<Object>} API response with project areas
   */
  getAll() {
    return this.http.get(`${this.resourcePath}?active=true`);
  }

  /**
   * Get project area by ID
   * @param {string} id - Project area ID
   * @returns {Promise<Object>} API response with project area
   */
  getById(id) {
    return this.http.get(`${this.resourcePath}/${id}`);
  }

  /**
   * Search project areas by name
   * @param {string} query - Search query
   * @returns {Promise<Object>} API response with matching project areas
   */
  search(query) {
    const params = new URLSearchParams({
      name_like: query,
      active: true,
    });
    return this.http.get(`${this.resourcePath}?${params}`);
  }

  /**
   * Create new project area
   * @param {Object} areaData - Project area data
   * @returns {Promise<Object>} API response with created project area
   */
  create(areaData) {
    return this.http.post(this.resourcePath, {
      ...areaData,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update project area
   * @param {string} id - Project area ID
   * @param {Object} areaData - Updated project area data
   * @returns {Promise<Object>} API response with updated project area
   */
  update(id, areaData) {
    return this.http.put(`${this.resourcePath}/${id}`, {
      ...areaData,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Deactivate project area (soft delete)
   * @param {string} id - Project area ID
   * @returns {Promise<Object>} API response
   */
  deactivate(id) {
    return this.http.patch(`${this.resourcePath}/${id}`, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }
}
