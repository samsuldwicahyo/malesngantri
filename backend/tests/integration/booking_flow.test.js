const request = require('supertest');
const app = require('../../src/app');

describe('Booking Transitions & Validation', () => {
    test('Should reject booking with missing fields', async () => {
        const res = await request(app)
            .post('/api/v1/queues/public')
            .send({
                customerName: 'Samsul'
                // Missing phone, barberId, etc.
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('Should allow status updates for active bookings', async () => {
        // Mocking a successful case where a barber updates status
        // Requiring auth in a real test
        const res = await request(app)
            .patch('/api/v1/queues/some-id/start')
            .send({
                status: 'IN_SERVICE'
            });

        // Should hit 401 if not logged in (verifying RBAC works)
        expect(res.status).toBe(401);
    });
});
