// Comment API
import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

/**
 * Comment API Service
 * Handles HTTP requests for comment-related operations
 */
export class CommentApi extends BaseEndpoint {
  constructor() {
    const baseApi = new BaseApi();
    super(baseApi, '/comments');

    // Debugging interceptors
    this.http.interceptors.request.use(request => {
      console.log('🚀 Comment API Request:', request.method?.toUpperCase(), request.url);
      console.log('📦 Comment Request Data:', request.data);
      return request;
    });

    this.http.interceptors.response.use(response => {
      console.log('✅ Comment API Response:', response.status, response.data);
      return response;
    }, error => {
      console.log('❌ Comment API Error:', error.response?.status, error.message);
      console.log('📋 Comment Error Details:', error.response?.data);
      return Promise.reject(error);
    });
  }

  /**
   * Get all comments for a profile
   * @param {string} profileId - Profile ID
   * @returns {Promise} API response
   */
  getCommentsByProfile(profileId) {
    return this.http.get(`${this.endpointPath}?profileId=${encodeURIComponent(profileId)}`);
  }

  /**
   * Add a new comment
   * @param {Object} comment - Comment data
   * @returns {Promise} API response
   */
  addComment(comment) {
    return this.http.post(this.endpointPath, comment);
  }
}
