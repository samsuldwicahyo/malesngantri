const request = require('supertest');
const app = require('../../src/app');

describe.skip('RBAC guard (example)', () => {
    it('blocks CUSTOMER from worker/admin queue transition endpoint', async () => {
        const customerToken = 'replace-with-customer-jwt';
        const queueId = 'replace-with-queue-id';

        const res = await request(app)
            .patch(`/api/v1/queues/${queueId}/start`)
            .set('Authorization', `Bearer ${customerToken}`)
            .send();

        expect([401, 403]).toContain(res.statusCode);
    });

    it('blocks SUPER_ADMIN from tenant operational queue transitions', async () => {
        const superadminToken = 'replace-with-superadmin-jwt';
        const queueId = 'replace-with-queue-id';

        const res = await request(app)
            .patch(`/api/v1/queues/${queueId}/check-in`)
            .set('Authorization', `Bearer ${superadminToken}`)
            .send();

        expect([401, 403]).toContain(res.statusCode);
    });
});
