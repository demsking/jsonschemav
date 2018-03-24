module.exports = {
  expand: true,
  notify: true,
  testMatch: [
    '<rootDir>/test/specs/*.spec.js',
    '<rootDir>/test/specs/**/*.spec.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!.eslintrc.js',
    '!*.js',
    '!test/**',
    '!demo/**',
    '!dist/**',
    '!coverage/**',
    '!**/node_modules/**'
  ],
  moduleFileExtensions: [
    'js',
    'json'
  ]
}
