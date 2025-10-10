import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Categories API Service
 * Handles HTTP requests for category-related operations
 */
export class CategoriesApi extends BaseEndpoint {
  constructor() {
    const baseApi = new BaseApi();
    super(baseApi, '/categories');
  }

  /**
   * Get active categories
   * @returns {Promise} API response
   */
  getActiveCategories() {
    return this.http.get(`${this.endpointPath}/active`);
  }

  /**
   * Get category statistics
   * @param {string} categoryId - Category ID
   * @returns {Promise} API response
   */
  getCategoryStats(categoryId) {
    return this.http.get(`${this.endpointPath}/${categoryId}/stats`);
  }
}