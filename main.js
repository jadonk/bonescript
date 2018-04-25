module.exports = process.env.BONESCRIPT_COV ?
    require('./src-cov/index') :
    require('./src/index');