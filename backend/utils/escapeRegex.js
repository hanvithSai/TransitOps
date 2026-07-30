/**
 * Escape user input for safe use in MongoDB $regex queries.
 */
const escapeRegex = (value) => {
    if (!value || typeof value !== "string") return "";
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = escapeRegex;
