const PLACEHOLDER_SECRETS = new Set([
    'your_jwt_secret_key_here',
    'changeme',
    'secret',
    'jwt_secret',
]);

const validateEnv = () => {
    const required = ['MONGO_URI', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]?.trim());

    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    const secret = process.env.JWT_SECRET.trim();
    if (PLACEHOLDER_SECRETS.has(secret) || secret.length < 16) {
        console.error(
            'JWT_SECRET must be set to a strong, non-placeholder value (minimum 16 characters).'
        );
        process.exit(1);
    }
};

module.exports = validateEnv;
