// infrastructure/user.assembler.js
import { User } from '../domain/model/user.entity.js';

/**
 * User Assembler
 * Transforms data between API and domain entities
 */
export class UserAssembler {
    /**
     * Transform API response to User entity
     * @param {Object} apiData - Raw API data
     * @returns {User} User entity
     */
    static fromApiToEntity(apiData) {
        if (!apiData) return null;

        return new User({
            id: apiData.id,
            fullName: apiData.fullName || '',
            email: apiData.email || '',
            password: apiData.password || '',
            status: apiData.status || 'active',
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt
        });
    }

    /**
     * Transform User entity to API format
     * @param {User} entity - User entity
     * @returns {Object} API formatted data
     */
    static fromEntityToApi(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            password: entity.password,
            status: entity.status,
            createdAt: entity.createdAt?.toISOString(),
            updatedAt: entity.updatedAt?.toISOString()
        };
    }

    /**
     * Transform registration data to API format
     * @param {Object} registrationData - Registration form data
     * @returns {Object} API formatted registration data
     */
    static fromRegistrationToApi(registrationData) {
        return {
            fullName: registrationData.fullName,
            email: registrationData.email,
            password: registrationData.password,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

}