module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jshint-jsx');
    grunt.loadNpmTasks('grunt-env');

    // Default task(s).
    grunt.registerTask('default', ['env:dist', 'jshint', 'browserify:prod', 'uglify', 'copy']);
    grunt.registerTask('debug', ['env:dev','jshint', 'browserify:dev', 'uglify', 'copy']);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            dist: {
                NODE_ENV : 'production'
            },
            dev: {
                NODE_ENV: 'development'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/prex.min.js': ['dist/prex.js']
                }
            }
        },
        browserify: {
            prod: {
                files: { 'dist/prex.js': ['src/js/prex.js']},
                options: {
                    transform: [['babelify', {presets: ['es2015', 'react']}]]
                }
            },
            dev: {
                files: { 'dist/prex.js': ['src/js/prex.js']},
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    transform: [['babelify', {presets: ['es2015', 'react']}]]
                }

            }
        },
        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'src/proto/', src: ['*'], dest: 'dist/proto/', filter: 'isFile'},
                    {expand: true, cwd: 'src/proto/', src: ['*'], dest: 'demo/proto/', filter: 'isFile'},
                    {expand: true, cwd: 'src/proto/', src: ['*'], dest: 'test/proto/', filter: 'isFile'}
                ]
            }
        },
        jshint: {
            files: {
                src: ['src/js/**/*.js']
            },
            options: {
                globals: {
                    console: true
                },
                browserify: true,
                esversion: 6,
                browser: true
            }
        }
    });
};
