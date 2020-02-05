const path = require('path');

const root = path.resolve(__dirname, '../../');
const projectsDir = path.resolve(root, 'projects');
const xmlMatchRegExp = /\(\s*([\'\"])([^\1()]+?\.xml)\1\s*\)/g;

module.exports = { root, projectsDir, xmlMatchRegExp };
