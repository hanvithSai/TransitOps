jest.mock('../models/User', () => ({
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
}));

jest.mock('../models/Role', () => ({
    findOne: jest.fn(),
}));

const User = require('../models/User');
const Role = require('../models/Role');
const { register } = require('../services/authService');

describe('authService.register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects admin role on self-registration', async () => {
        await expect(register('Attacker', 'evil@test.com', 'Secure1!', 'admin'))
            .rejects
            .toMatchObject({ message: 'Admin accounts cannot be created via self-registration.', statusCode: 403 });

        expect(Role.findOne).not.toHaveBeenCalled();
        expect(User.create).not.toHaveBeenCalled();
    });

    it('allows non-admin roles', async () => {
        Role.findOne.mockResolvedValue({ _id: 'role1', name: 'driver' });
        User.create.mockResolvedValue({ _id: 'user1' });
        User.findById = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                populate: jest.fn().mockResolvedValue({ _id: 'user1', role: { name: 'driver' } }),
            }),
        });

        await register('Jane', 'jane@test.com', 'Secure1!', 'Driver');
        expect(User.create).toHaveBeenCalled();
    });
});
