import { BaseApi } from "../../shared/infrastructure/base-api.js";
import { BaseEndpoint } from "../../shared/infrastructure/base-endpoint.js";

export class NotificationsApi extends BaseEndpoint {
  constructor() {
    const baseApi = new BaseApi();
    super(baseApi, "/notifications");
  }

  async getAll() {
    return this.http.get(this.endpointPath);
  }

  async getById(id) {
    return this.http.get(`${this.endpointPath}/${id}`);
  }

  async getByProjectId(projectId) {
    return this.http.get(`${this.endpointPath}?projectId=${projectId}`);
  }

  async getByUserId(userId) {
    return this.http.get(`${this.endpointPath}?userId=${userId}`);
  }

  async getByProjectAndUser(projectId, userId) {
    return this.http.get(`${this.endpointPath}?projectId=${projectId}&userId=${userId}`);
  }

  async create(notificationData) {
    return this.http.post(this.endpointPath, notificationData);
  }

  async update(id, notificationData) {
    return this.http.put(`${this.endpointPath}/${id}`, notificationData);
  }

  async delete(id) {
    return this.http.delete(`${this.endpointPath}/${id}`);
  }

  async markAsRead(id) {
    return this.http.patch(`${this.endpointPath}/${id}`, {
      readAt: new Date().toISOString(),
    });
  }

  async markAllAsReadForUser(userId) {
    const readAt = new Date().toISOString();
    return this.http.patch(`${this.endpointPath}?userId=${userId}`, { readAt });
  }

  async getRecentByProject(projectId, daysThreshold = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    const cutoffISO = cutoffDate.toISOString();

    return this.http.get(
      `${this.endpointPath}?projectId=${projectId}&createdAt_gte=${cutoffISO}`
    );
  }
}
