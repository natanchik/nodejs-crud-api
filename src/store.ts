import { User, CreateUserDto, UpdateUserDto } from './types.js';
import { v4 as uuidv4 } from 'uuid';
import { validate as validateUUID } from 'uuid';

const store = new Map<string, User>();

// Add initial test users
const initialUsers: CreateUserDto[] = [
    {
        username: 'John Doe',
        age: 28,
        hobbies: ['reading', 'hiking', 'photography']
    },
    {
        username: 'Jane Smith',
        age: 24,
        hobbies: ['painting', 'yoga', 'traveling']
    },
    {
        username: 'Bob Johnson',
        age: 32,
        hobbies: ['gaming', 'cooking', 'gardening']
    }
];

// Initialize store with test users
initialUsers.forEach((userData) => {
    const id = uuidv4();
    const user: User = {
        id,
        ...userData
    };
    store.set(id, user);
});

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export const validateUserId = (id: string): void => {
    if (!validateUUID(id)) {
        throw new ValidationError('Invalid user ID format');
    }
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
    if (
        !data.username ||
        typeof data.age !== 'number' ||
        !Array.isArray(data.hobbies)
    ) {
        throw new ValidationError(
            'Missing required fields: username (string), age (number), hobbies (array)'
        );
    }

    const id = uuidv4();
    const user: User = {
        id,
        username: data.username,
        age: data.age,
        hobbies: data.hobbies
    };
    store.set(id, user);
    return user;
};

export const listUsers = async (): Promise<User[]> => {
    return Array.from(store.values());
};

export const getUser = async (id: string): Promise<User> => {
    validateUserId(id);
    const user = store.get(id);
    if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
};

export const updateUser = async (
    id: string,
    data: UpdateUserDto
): Promise<User> => {
    validateUserId(id);
    const existing = store.get(id);
    if (!existing) {
        throw new NotFoundError(`User with id ${id} not found`);
    }

    const updated: User = {
        ...existing,
        ...data
    };
    store.set(id, updated);
    return updated;
};

export const deleteUser = async (id: string): Promise<void> => {
    validateUserId(id);
    if (!store.has(id)) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
    store.delete(id);
};

export const clearStore = (): void => {
    store.clear();
};
