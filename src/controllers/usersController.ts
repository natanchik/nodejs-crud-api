import { CreateUserDto, UpdateUserDto } from '../types.js';
import {
    createUser,
    deleteUser,
    getUser,
    listUsers,
    updateUser,
    ValidationError,
    NotFoundError
} from '../store.js';

export const getUsers = async () => {
    try {
        const users = await listUsers();
        return {
            status: 200,
            body: users
        };
    } catch (error) {
        return {
            status: 500,
            body: { message: 'Internal server error' }
        };
    }
};

export const addUser = async (payload: string) => {
    try {
        const data = JSON.parse(payload) as CreateUserDto;
        const user = await createUser(data);
        return {
            status: 201,
            body: user
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            return {
                status: 400,
                body: { message: error.message }
            };
        }
        if (error instanceof SyntaxError) {
            return {
                status: 400,
                body: { message: 'Invalid JSON payload' }
            };
        }
        return {
            status: 500,
            body: { message: 'Internal server error' }
        };
    }
};

export const getOneUser = async (id: string) => {
    try {
        const user = await getUser(id);
        return {
            status: 200,
            body: user
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            return {
                status: 400,
                body: { message: error.message }
            };
        }
        if (error instanceof NotFoundError) {
            return {
                status: 404,
                body: { message: error.message }
            };
        }
        return {
            status: 500,
            body: { message: 'Internal server error' }
        };
    }
};

export const editUser = async (id: string, payload: string) => {
    try {
        const data = JSON.parse(payload) as UpdateUserDto;
        const user = await updateUser(id, data);
        return {
            status: 200,
            body: user
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            return {
                status: 400,
                body: { message: error.message }
            };
        }
        if (error instanceof NotFoundError) {
            return {
                status: 404,
                body: { message: error.message }
            };
        }
        if (error instanceof SyntaxError) {
            return {
                status: 400,
                body: { message: 'Invalid JSON payload' }
            };
        }
        return {
            status: 500,
            body: { message: 'Internal server error' }
        };
    }
};

export const removeUser = async (id: string) => {
    try {
        await deleteUser(id);
        return {
            status: 204,
            body: null
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            return {
                status: 400,
                body: { message: error.message }
            };
        }
        if (error instanceof NotFoundError) {
            return {
                status: 404,
                body: { message: error.message }
            };
        }
        return {
            status: 500,
            body: { message: 'Internal server error' }
        };
    }
};
