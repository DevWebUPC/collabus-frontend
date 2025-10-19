import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';

export class TaskSubmissionApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        super(baseApi, '/task-submissions');
    }

    getByTaskId(taskId) {
        return this.http.get(`${this.endpointPath}?taskId=${taskId}`);
    }

    getById(submissionId) {
        return this.http.get(`${this.endpointPath}/${submissionId}`);
    }

    create(submissionData) {
        return this.http.post(this.endpointPath, submissionData);
    }

    update(submissionId, updateData) {
        return this.http.patch(`${this.endpointPath}/${submissionId}`, updateData);
    }

    delete(submissionId) {
        return this.http.delete(`${this.endpointPath}/${submissionId}`);
    }
}