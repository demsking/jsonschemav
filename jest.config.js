module.exports = {
  expand: true,
  notify: true,
  testMatch: ['<rootDir>/test/specs/*.spec.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,vue}',
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
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
