import { BaseApi } from "../../shared/infrastructure/base-api.js";

/**
 * Academic Levels API
 * Handles API calls for academic/professional levels
 */
export class AcademicLevelsApi extends BaseApi {
  constructor() {
    super();
    this.resourcePath = "/academicLevels";
  }

  /**
   * Get all active academic levels
   * @returns {Promise<Object>} API response with academic levels
   */
  getAll() {
    return this.http.get(
      `${this.resourcePath}?active=true&_sort=level&_order=asc`
    );
  }

  /**
   * Get academic level by ID
   * @param {string} id - Academic level ID
   * @returns {Promise<Object>} API response with academic level
   */
  getById(id) {
    return this.http.get(`${this.resourcePath}/${id}`);
  }

  /**
   * Get academic levels by category
   * @param {string} category - Category filter (student, professional, expert)
   * @returns {Promise<Object>} API response with matching academic levels
   */
  getByCategory(category) {
    let levelFilter = "";
    switch (category) {
      case "student":
        levelFilter = "level_lte=2";
        break;
      case "professional":
        levelFilter = "level_gte=3&level_lte=4";
        break;
      case "expert":
        levelFilter = "level_gte=5";
        break;
      default:
        levelFilter = "";
    }

    const params = new URLSearchParams(
      `active=true&${levelFilter}&_sort=level&_order=asc`
    );
    return this.http.get(`${this.resourcePath}?${params}`);
  }

  /**
   * Create new academic level
   * @param {Object} levelData - Academic level data
   * @returns {Promise<Object>} API response with created academic level
   */
  create(levelData) {
    return this.http.post(this.resourcePath, {
      ...levelData,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update academic level
   * @param {string} id - Academic level ID
   * @param {Object} levelData - Updated academic level data
   * @returns {Promise<Object>} API response with updated academic level
   */
  update(id, levelData) {
    return this.http.put(`${this.resourcePath}/${id}`, {
      ...levelData,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Deactivate academic level (soft delete)
   * @param {string} id - Academic level ID
   * @returns {Promise<Object>} API response
   */
  deactivate(id) {
    return this.http.patch(`${this.resourcePath}/${id}`, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
  }
}
