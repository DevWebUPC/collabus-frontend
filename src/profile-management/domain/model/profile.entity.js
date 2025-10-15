/**
 * Profile Entity
 * Represents a user profile in the domain with business logic and validation
 */
export class Profile {
    constructor({
                    id = null,
                    userId = null,
                    username = '',
                    avatar = null,
                    role = '',
                    bio = '',
                    abilities = [],
                    experiences = [],
                    cv = null,
                    status = 'active',
                    points = 0, // 👈 Nuevo campo - inicializado en 0
                    projects = [], // 👈 Nuevo campo - array vacío
                    pointsGivenBy = [],
                    createdAt = null,
                    updatedAt = null
                } = {}) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.avatar = avatar;
        this.role = role;
        this.bio = bio;
        this.abilities = abilities;
        this.experiences = experiences;
        this.cv = cv;
        this.status = status;
        this.points = points; // 👈 Inicializar puntos
        this.projects = projects; // 👈 Inicializar proyectos
        this.pointsGivenBy = pointsGivenBy;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    }

    // Business logic methods
    isComplete() {
        return this.username && this.role && this.bio;
    }

    hasUserGivenPoint(userId) {
        return this.pointsGivenBy?.includes(userId) || false;
    }

    toggleUserPoint(userId) {
        if (!this.pointsGivenBy) {
            this.pointsGivenBy = [];
        }

        const userIndex = this.pointsGivenBy.indexOf(userId);

        if (userIndex === -1) {
            // Agregar punto
            this.pointsGivenBy.push(userId);
            this.points += 1;
            return true; // Punto agregado
        } else {
            // Quitar punto
            this.pointsGivenBy.splice(userId, 1);
            this.points = Math.max(0, this.points - 1);
            return false; // Punto quitado
        }
    }

    getCompletionPercentage() {
        let completedFields = 0;
        const totalFields = 6; // username, role, bio, abilities, experiences, avatar

        if (this.username) completedFields++;
        if (this.role) completedFields++;
        if (this.bio) completedFields++;
        if (this.abilities.length > 0) completedFields++;
        if (this.experiences.length > 0) completedFields++;
        if (this.avatar) completedFields++;

        return Math.round((completedFields / totalFields) * 100);
    }

    // 👇 Nuevos métodos para manejar puntos y proyectos
    addPoints(pointsToAdd) {
        this.points += pointsToAdd;
        this.updatedAt = new Date();
    }

    addProject(project) {
        this.projects.push(project);
        this.updatedAt = new Date();
    }

    removeProject(projectId) {
        this.projects = this.projects.filter(project => project.id !== projectId);
        this.updatedAt = new Date();
    }

    getProjectsCount() {
        return this.projects.length;
    }

    // Validation methods
    validateOnboarding() {
        const errors = [];

        if (!this.username.trim()) {
            errors.push('Username is required');
        } else if (this.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }

        if (!this.role.trim()) {
            errors.push('Role is required');
        }

        if (this.bio && this.bio.length > 500) {
            errors.push('Bio must be less than 500 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Profile methods
    hasCV() {
        return !!this.cv && !!this.cv.data;
    }


    getCVInfo() {
        if (!this.cv) return null;

        return {
            fileName: this.cv.fileName,
            fileType: this.cv.fileType,
            fileSize: this.cv.fileSize,
            uploadedAt: this.cv.uploadedAt
        };
    }

    getSkillsCount() {
        return this.abilities.length;
    }

    getExperienceCount() {
        return this.experiences.length;
    }
}
