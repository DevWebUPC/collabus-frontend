import { Role } from './role.entity.js';

/**
 * Project Entity
 * Represents a project in the domain with business logic and validation
 */
export class Project {
    constructor({
                    id = null,
                    title = '',
                    description = '',
                    category = '',
                    areas = [],
                    tags = [],
                    summary = '',
                    academicLevel = '',
                    skills = [],
                    durationQuantity = 1,
                    durationType = 'meses',
                    benefits = '',
                    roles = [],
                    status = 'draft',
                    progress = 0,
                    startDate = null,
                    endDate = null,
                    budget = 0,
                    userId = null,
                    collaborators = [],
                    tasks = [],
                    milestones = [],
                    myTasks = [],
                    notifications = [],
                    upcomingDeadlines = [],
                    overdueTasks = [],
                    overdueMilestones = [],
                    createdAt = null,
                    updatedAt = null,
                    authorName = null
                } = {}) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.areas = Array.isArray(areas) ? [...areas] : [];
        this.tags = Array.isArray(tags) ? [...tags] : [];
        this.summary = summary;
        this.academicLevel = academicLevel;
        this.skills = Array.isArray(skills) ? [...skills] : [];
        this.durationQuantity = durationQuantity;
        this.durationType = durationType;
        this.benefits = benefits;
        this.roles = Array.isArray(roles) ? roles.map(role => new Role(role)) : [];
        this.status = status;
        this.progress = progress;
        this.startDate = startDate ? new Date(startDate) : null;
        this.endDate = endDate ? new Date(endDate) : null;
        this.budget = budget;
        this.userId = userId;
        this.collaborators = collaborators;
        this.tasks = tasks;
        this.milestones = milestones;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
        this.myTasks = myTasks;
        this.notifications = notifications;
        this.upcomingDeadlines = upcomingDeadlines;
        this.overdueTasks = overdueTasks;
        this.overdueMilestones = overdueMilestones;
        this.authorName = authorName;
    }

    // Business logic methods
    isActive() {
        return this.status === 'active';
    }

    isCompleted() {
        return this.status === 'completed';
    }

    isDraft() {
        return this.status === 'draft';
    }

    getFormattedProgress() {
        return `${this.progress}%`;
    }

    getDaysRemaining() {
        if (!this.endDate) return null;
        const now = new Date();
        const diffTime = this.endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    // Role management methods
    addRole(roleData = {}) {
        const newRole = new Role({
            ...roleData,
            projectId: this.id
        });
        this.roles.push(newRole);
        this.updatedAt = new Date();
        return newRole;
    }

    removeRole(roleId) {
        const initialLength = this.roles.length;
        this.roles = this.roles.filter(role => role.id !== roleId);

        if (this.roles.length < initialLength) {
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    updateRole(roleId, updates) {
        const role = this.roles.find(r => r.id === roleId);
        if (role) {
            Object.assign(role, updates);
            role.updatedAt = new Date();
            this.updatedAt = new Date();
            return role;
        }
        return null;
    }

    getRoleById(roleId) {
        return this.roles.find(role => role.id === roleId);
    }

    // Skills management
    addSkill(skill) {
        if (skill.trim() && !this.skills.includes(skill.trim())) {
            this.skills.push(skill.trim());
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    removeSkill(skill) {
        const index = this.skills.indexOf(skill);
        if (index > -1) {
            this.skills.splice(index, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Tags management
    addTag(tag) {
        if (tag.trim() && !this.tags.includes(tag.trim())) {
            this.tags.push(tag.trim());
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    // Areas management
    addArea(area) {
        if (area.trim() && !this.areas.includes(area.trim())) {
            this.areas.push(area.trim());
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    removeArea(area) {
        const index = this.areas.indexOf(area);
        if (index > -1) {
            this.areas.splice(index, 1);
            this.updatedAt = new Date();
            return true;
        }
        return false;
    }

    addCollaborator(collaborator) {
        if (!this.collaborators.find(c => c.id === collaborator.id)) {
            this.collaborators.push(collaborator);
            this.updatedAt = new Date();
        }
    }

    removeCollaborator(collaboratorId) {
        this.collaborators = this.collaborators.filter(c => c.id !== collaboratorId);
        this.updatedAt = new Date();
    }

    updateProgress(newProgress) {
        if (newProgress >= 0 && newProgress <= 100) {
            this.progress = newProgress;
            this.updatedAt = new Date();

            if (newProgress === 100 && this.status !== 'completed') {
                this.status = 'completed';
            }
        }
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.updatedAt = new Date();
    }

    // Método para marcar notificación como leída
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }

    validate() {
        const errors = [];

        // Step 1 validation
        if (!this.title.trim()) {
            errors.push('Project title is required');
        }

        if (this.areas.length === 0) {
            errors.push('At least one area is required');
        }

        if (!this.summary.trim()) {
            errors.push('Project summary is required');
        }

        // Step 2 validation
        if (!this.benefits.trim()) {
            errors.push('Benefits description is required');
        }

        if (this.skills.length === 0) {
            errors.push('At least one skill is required');
        }

        if (!this.academicLevel.trim()) {
            errors.push('Academic level is required');
        }

        if (this.durationQuantity <= 0) {
            errors.push('Duration must be greater than 0');
        }

        // Step 3 validation (roles)
        if (this.roles.length === 0) {
            errors.push('At least one role is required');
        }

        this.roles.forEach((role, index) => {
            const roleValidation = role.validate();
            if (!roleValidation.isValid) {
                roleValidation.errors.forEach(error => {
                    errors.push(`Role ${index + 1}: ${error}`);
                });
            }
        });

        // Legacy validations
        if (this.endDate && this.startDate && this.endDate < this.startDate) {
            errors.push('End date must be after start date');
        }

        if (this.budget < 0) {
            errors.push('Budget cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}