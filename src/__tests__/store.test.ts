import {
    createUser,
    getUser,
    listUsers,
    updateUser,
    deleteUser,
    clearStore
} from '../store.js';
import { CreateUserDto } from '../types.js';

describe('store', () => {
    beforeEach(() => clearStore());

    it('creates and retrieves a user', async () => {
        const newUser: CreateUserDto = {
            username: 'John Doe',
            age: 25,
            hobbies: ['reading']
        };
        const created = await createUser(newUser);
        expect(created.id).toBeDefined();
        const fetched = await getUser(created.id);
        expect(fetched).toEqual(created);
    });

    it('lists users', async () => {
        await createUser({ username: 'User A', age: 20, hobbies: [] });
        await createUser({ username: 'User B', age: 30, hobbies: [] });
        const users = await listUsers();
        expect(users.length).toBe(2);
    });

    it('updates a user', async () => {
        const user = await createUser({
            username: 'Old Name',
            age: 25,
            hobbies: []
        });
        const updated = await updateUser(user.id, { username: 'New Name' });
        expect(updated).not.toBeNull();
        expect(updated?.username).toBe('New Name');
    });

    it('deletes a user', async () => {
        const user = await createUser({
            username: 'To Delete',
            age: 25,
            hobbies: []
        });
        await deleteUser(user.id);
        await expect(getUser(user.id)).rejects.toThrow('not found');
    });
});
