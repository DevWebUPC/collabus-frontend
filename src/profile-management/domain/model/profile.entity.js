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
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
    }

    // Business logic methods
    isComplete() {
        return this.username && this.role && this.bio;
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
        return !!this.cv;
    }

    getSkillsCount() {
        return this.abilities.length;
    }

    getExperienceCount() {
        return this.experiences.length;
    }
}