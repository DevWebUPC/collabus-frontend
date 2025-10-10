import { BaseApi } from "../../shared/infrastructure/base-api.js";

/**
 * Duration Types API
 * Handles API calls for duration types
 */
export class DurationTypesApi extends BaseApi {
  constructor() {
    super();
    this.resourcePath = "/durationTypes";
  }

  /**
   * Get all active duration types
   * @returns {Promise<Object>} API response with duration types
   */
  async getAll() {
    return this.http.get(
      `${this.resourcePath}?active=true&_sort=multiplier&_order=asc`
    );
  }

  /**
   * Get duration type by ID
   * @param {string} id - Duration type ID
   * @returns {Promise<Object>} API response with duration type
   */
  async getById(id) {
    return this.http.get(`${this.resourcePath}/${id}`);
  }

  /**
   * Get duration type by value
   * @param {string} value - Duration type value
   * @returns {Promise<Object>} API response with duration type
   */
  async getByValue(value) {
    return this.http.get(`${this.resourcePath}?value=${value}&active=true`);
  }

  /**
   * Get duration types by category
   * @param {string} category - Category filter (short-term, medium-term, long-term)
   * @returns {Promise<Object>} API response with matching duration types
   */
  async getByCategory(category) {
    let multiplierFilter = "";
    switch (category) {
      case "short-term":
        multiplierFilter = "multiplier_lte=7";
        break;
      case "medium-term":
        multiplierFilter = "multiplier_gte=8&multiplier_lte=90";
        break;
      case "long-term":
        multiplierFilter = "multiplier_gte=91";
        break;
      default:
        multiplierFilter = "";
    }

    const params = new URLSearchParams(
      `active=true&${multiplierFilter}&_sort=multiplier&_order=asc`
    );
    return this.http.get(`${this.resourcePath}?${params}`);
  }

  /**
   * Create new duration type
   * @param {Object} durationData - Duration type data
   * @returns {Promise<Object>} API response with created duration type
   */
  async create(durationData) {
    return this.http.post(this.resourcePath, {
      ...durationData,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update duration type
   * @param {string} id - Duration type ID
   * @param {Object} durationData - Updated duration type data
   * @returns {Promise<Object>} API response with updated duration type
   */
  async update(id, durationData) {
    return this.http.put(`${this.resourcePath}/${id}`, {
      ...durationData,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Deactivate duration type (soft delete)
   * @param {string} id - Duration type ID
   * @returns {Promise<Object>} API response
   */
  async deactivate(id) {
    return this.http.patch(`${this.resourcePath}/${id}`, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }
}
