async function isProd() {
    if (process.env.HOST.includes('localhost') || process.env.HOST !== 'https://honey-do-list-be-develop-production.up.railway.app') {
        return false;
    }
    return true;
}

module.exports = {
    isProd
};