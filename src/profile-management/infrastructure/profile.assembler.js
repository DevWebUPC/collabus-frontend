// infrastructure/profile.assembler.js
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
            cv: entity.cv,
            status: entity.status,
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
            cv: onboardingData.skills?.cv || null,
            status: 'active',
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
     * Transform profile update data to API format
     * @param {Object} updateData - Profile update data
     * @returns {Object} API formatted update data
     */
    static fromUpdateToApi(updateData) {
        const apiData = { ...updateData };
        apiData.updatedAt = new Date().toISOString();
        return apiData;
    }
}