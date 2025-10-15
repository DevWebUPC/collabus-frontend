import { Profile } from '../domain/model/profile.entity.js';

/**
 * Profile Assembler
 * Transforms data between API and domain entities
 */
export class ProfileAssembler {
    /**
     * Transform API response to Profile entity
     * @param {Object} apiData - Raw API data
     * @returns {Profile} Profile entity
     */
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        return new Profile({
            id: apiData.id,
            userId: apiData.userId,
            username: apiData.username || '',
            avatar: apiData.avatar || null,
            role: apiData.role || '',
            bio: apiData.bio || '',
            abilities: apiData.abilities || [],
            experiences: apiData.experiences || [],
            cv: apiData.cv || null,
            status: apiData.status || 'active',
            points: apiData.points || 0,
            projects: apiData.projects || [],
            pointsGivenBy: apiData.pointsGivenBy || [],
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt
        });
    }

    /**
     * Transform Profile entity to API format
     * @param {Profile} entity - Profile entity
     * @returns {Object} API formatted data
     */
    static fromEntityToApi(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            userId: entity.userId,
            username: entity.username,
            avatar: entity.avatar,
            role: entity.role,
            bio: entity.bio,
            abilities: entity.abilities,
            experiences: entity.experiences,
            cv: entity.cv, // ✅ Ahora el CV está en formato Base64
            status: entity.status,
            points: entity.points,
            projects: entity.projects,
            pointsGivenBy: entity.pointsGivenBy,
            createdAt: entity.createdAt?.toISOString(),
            updatedAt: entity.updatedAt?.toISOString()
        };
    }

    /**
     * Transform onboarding data to API format
     * @param {Object} onboardingData - Onboarding form data
     * @param {string} userId - User ID
     * @returns {Object} API formatted onboarding data
     */
    static fromOnboardingToApi(onboardingData, userId) {
        const profileData = {
            userId: userId,
            username: onboardingData.profile?.username || '',
            avatar: onboardingData.profile?.avatar || null,
            role: onboardingData.role?.selectedRole || onboardingData.role?.customRole || '',
            bio: onboardingData.description?.bio || '',
            abilities: onboardingData.skills?.abilities || [],
            experiences: onboardingData.skills?.experiences || [],
            cv: onboardingData.skills?.cv || null, // ✅ Ahora el CV está en Base64
            status: 'active',
            points: 0,
            projects: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Remove empty values
        Object.keys(profileData).forEach(key => {
            if (profileData[key] === '' || profileData[key] === null) {
                delete profileData[key];
            }
        });

        return profileData;
    }

    /**
     * Transform update data to API format
     * @param {Object} updateData - Update form data
     * @returns {Object} API formatted update data
     */
    static fromUpdateToApi(updateData) {
        const updateObj = {
            username: updateData.username,
            role: updateData.role,
            bio: updateData.bio,
            abilities: updateData.abilities,
            experiences: updateData.experiences,
            points: updateData.points,
            pointsGivenBy: updateData.pointsGivenBy,
            updatedAt: new Date().toISOString()
        };

        // Incluir CV si está presente
        if (updateData.cv) {
            updateObj.cv = updateData.cv;
        }

        return updateObj;
    }
}