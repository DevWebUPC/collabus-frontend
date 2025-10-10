import { Notification } from '../domain/model/notification.entity.js';

export class NotificationAssembler {
  
  static fromApiToEntity(apiData) {
    if (!apiData) return null;
    
    return new Notification({
      id: apiData.id,
      message: apiData.message,
      type: apiData.type,
      userId: apiData.userId,
      projectId: apiData.projectId,
      createdAt: apiData.createdAt,
      readAt: apiData.readAt
    });
  }

  static fromEntityToApi(entity) {
    if (!entity) return null;
    
    return {
      id: entity.id,
      message: entity.message,
      type: entity.type,
      userId: entity.userId,
      projectId: entity.projectId,
      createdAt: entity.createdAt?.toISOString(),
      readAt: entity.readAt?.toISOString()
    };
  }

  static fromApiArrayToEntityArray(apiArray) {
    if (!Array.isArray(apiArray)) return [];
    
    return apiArray
      .map(apiData => this.fromApiToEntity(apiData))
      .filter(entity => entity !== null);
  }

  static fromEntityArrayToApiArray(entityArray) {
    if (!Array.isArray(entityArray)) return [];
    
    return entityArray
      .map(entity => this.fromEntityToApi(entity))
      .filter(apiData => apiData !== null);
  }

  // Helper method to get notifications with additional processing
  static getProjectNotificationsData(apiResponse, projectId, userId = null) {
    if (!apiResponse || !apiResponse.data) {
      return {
        notifications: [],
        unreadCount: 0,
        recentCount: 0
      };
    }

    const notifications = this.fromApiArrayToEntityArray(apiResponse.data);
    
    // Filter by project
    const projectNotifications = notifications.filter(notification => 
      notification.belongsToProject(projectId)
    );

    // Further filter by user if provided
    const userNotifications = userId ? 
      projectNotifications.filter(notification => notification.belongsToUser(userId)) :
      projectNotifications;

    // Calculate metrics
    const unreadCount = userNotifications.filter(n => !n.isRead()).length;
    const recentCount = userNotifications.filter(n => n.isRecent()).length;

    // Sort by creation date (most recent first)
    const sortedNotifications = userNotifications.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      notifications: sortedNotifications,
      unreadCount,
      recentCount
    };
  }

  // Get only recent notifications for display
  static getRecentNotifications(apiResponse, projectId, userId = null, limit = 5) {
    const data = this.getProjectNotificationsData(apiResponse, projectId, userId);
    
    return {
      ...data,
      notifications: data.notifications
        .filter(n => n.isRecent())
        .slice(0, limit)
    };
  }
}