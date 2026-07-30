jest.mock('../models/User', () => ({
    findOne: jest.fn(),
}));

jest.mock('../utils/sendEmail', () => jest.fn());

const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { forgotPassword } = require('../services/authService');

describe('authService.forgotPassword', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns sent:false without error when email is unknown', async () => {
        User.findOne.mockResolvedValue(null);

        const result = await forgotPassword('unknown@test.com', 'http://localhost:5173');

        expect(result).toEqual({ sent: false });
        expect(sendEmail).not.toHaveBeenCalled();
    });
});
