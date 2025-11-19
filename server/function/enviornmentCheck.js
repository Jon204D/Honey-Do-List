async function isProd() {
    if (process.env.HOST.includes('localhost')) {
        return false;
    }
    return true;
}

module.exports = {
    isProd
};