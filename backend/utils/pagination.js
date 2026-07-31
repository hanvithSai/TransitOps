/**
 * Parse page/limit query params with safe defaults.
 */
const parsePagination = (query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    let limit = parseInt(query.limit, 10) || defaultLimit;
    if (Number.isNaN(limit) || limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;
    return { page, limit };
};

module.exports = { parsePagination };
