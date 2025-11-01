import request from 'supertest';
import { app } from '../index.js';
import { clearStore } from '../store.js';
import { CreateUserDto } from '../types.js';

describe('Users API', () => {
    beforeEach(() => {
        clearStore();
    });

    describe('CRUD Operations', () => {
        it('should return empty array when no users exist', async () => {
            const response = await request(app).get('/api/users').expect(200);

            expect(response.body).toEqual([]);
        });

        it('should create a new user and retrieve it by id', async () => {
            const newUser: CreateUserDto = {
                username: 'John Doe',
                age: 25,
                hobbies: ['reading', 'gaming']
            };

            // Create new user
            const createResponse = await request(app)
                .post('/api/users')
                .send(newUser)
                .expect(201);

            expect(createResponse.body).toMatchObject({
                ...newUser,
                id: expect.any(String)
            });

            // Get user by id
            const getUserResponse = await request(app)
                .get(`/api/users/${createResponse.body.id}`)
                .expect(200);

            expect(getUserResponse.body).toEqual(createResponse.body);
        });

        it('should update user and verify the changes', async () => {
            // Create initial user
            const initialUser: CreateUserDto = {
                username: 'Jane Doe',
                age: 30,
                hobbies: ['painting']
            };

            const createResponse = await request(app)
                .post('/api/users')
                .send(initialUser)
                .expect(201);

            const userId = createResponse.body.id;

            // Update user
            const updateData = {
                username: 'Jane Smith',
                hobbies: ['painting', 'dancing']
            };

            const updateResponse = await request(app)
                .put(`/api/users/${userId}`)
                .send(updateData)
                .expect(200);

            expect(updateResponse.body).toMatchObject({
                ...createResponse.body,
                ...updateData
            });

            // Verify updated data
            const getUpdatedResponse = await request(app)
                .get(`/api/users/${userId}`)
                .expect(200);

            expect(getUpdatedResponse.body).toEqual(updateResponse.body);
        });

        it('should delete user and confirm its removal', async () => {
            // Create user to delete
            const userToDelete: CreateUserDto = {
                username: 'To Delete',
                age: 35,
                hobbies: ['temporary']
            };

            const createResponse = await request(app)
                .post('/api/users')
                .send(userToDelete)
                .expect(201);

            const userId = createResponse.body.id;

            // Delete user
            await request(app).delete(`/api/users/${userId}`).expect(204);

            // Try to get deleted user
            await request(app).get(`/api/users/${userId}`).expect(404);
        });

        it('should handle invalid user ID format correctly', async () => {
            const invalidId = 'invalid-uuid';

            await request(app).get(`/api/users/${invalidId}`).expect(404);

            await request(app)
                .put(`/api/users/${invalidId}`)
                .send({ username: 'Test' })
                .expect(404);

            await request(app).delete(`/api/users/${invalidId}`).expect(404);
        });

        it('should validate required fields when creating a user', async () => {
            const invalidUser = {
                username: 'Missing Age',
                hobbies: []
            };

            await request(app).post('/api/users').send(invalidUser).expect(400);
        });
    });
});
