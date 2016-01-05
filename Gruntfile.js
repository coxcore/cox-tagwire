module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');

    function getReplaceData(type) {
        var arr = 'name description logo language since update version license hompage'.split(' ');
        var o = {};
        var i, l, s;

        for (i = 0, l = arr.length; i < l; i++){
            s = arr[i];
            o[s] = pkg[s];
        }

        o.update = '<%= grunt.template.today("yyyy.mm.dd") %>';
        o.gitHub = '<%= pkg.homepage %>';
        o.jspath = '../js';
        o.type = type;

        return o;
    }

    grunt.initConfig({

        pkg: pkg,

        dir: {
            src: 'src/',
            demo: 'demo/',
            release: '../release-tagwire/',
            dist: 'dist/'
        },

        banner: [
            '/*!',
            ' *  TagWire <%= pkg.version %> - coxcore.com',
            ' *',
            ' *  <%= pkg.description %>',
            ' *',
            ' *  @author  <%= pkg.author %> / <%= pkg.authorInfo.codename %>',
            ' *  @email   <%= pkg.authorInfo.email %>',
            ' *  @update  <%= grunt.template.today("yyyy.mm.dd") %> (since <%= pkg.since %>)',
            ' *  @license <%= pkg.license %>',
            ' */'
        ].join('\n'),
        
        jshint: {
            all: [
                '<%= dir.src %>js/*'
            ],

            options:{
                jshintrc: true,
                reporter: require('jshint-stylish')
            }
        },

        concat: {
            options: {
                banner: [
                    '<%= banner %>\n',
                    '(function(){',
                    '"use strict";\n',
                    '// module\n'
                ].join('\n'),

                separator: [
                    '\n// end of module\n\n',
                    '// module\n'
                ].join('\n'),

                footer: [
                    '\n// end of module\n\n',
                    '})();\n'
                ].join('\n'),

                stripBanners: {
                    block: true,
                    line: true
                }
            },

            basic: {
                src: [
                    '<%= dir.src %>js/cox.namespace.js',
                    '<%= dir.src %>js/cox.ready.js',
                    '<%= dir.src %>js/cox.css.js',
                    '<%= dir.src %>js/cox.TagWire.js',
                    '<%= dir.src %>js/jquery.TagWire.js'
                ],

                dest: '<%= dir.dist %>js/cox.tagwire.js'
            }
        },

        includereplace: {
            demo: {
                options: {
                    includesDir: '<%= dir.demo %>inc/',
                    globals: getReplaceData('demo')
                },
                src: '<%= dir.demo %>*.*',
                dest: '<%= dir.dist %>'
            },
            dev: {
                options: {
                    includesDir: '<%= dir.demo %>inc/',
                    globals: getReplaceData('dev')
                },
                src: '<%= dir.demo %>*.*',
                dest: '<%= dir.src %>'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>\n',
                mangle: false,

                compress: {
                    drop_console: false
                },

                beautify: false,
                preserveComments : false
            },

            build: {
                src: '<%= dir.dist %>js/cox.tagwire.js',
                dest: '<%= dir.dist %>js/cox.tagwire.min.js'
            }
        },

        clean: ['<%= dir.dist %>**'],

        copy: {
            main: {
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: '<%= dir.dist %>js/*',
                dest: '<%= dir.release %>js/'
            },
            demo:{
                expand: true,
                flatten: true,
                filter: 'isFile',
                src: '<%= dir.dist %><%= dir.demo %>*',
                dest: '<%= dir.release %><%= dir.demo %>'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-include-replace');

    grunt.registerTask('default', [
        'jshint',
        'concat',
        'uglify'
    ]);

    grunt.registerTask('demo', [
        'includereplace'
    ]);

    grunt.registerTask('build', [
        'clean',
        'default',
        'demo'
    ]);

    grunt.registerTask('release', [
        'build',
        'copy'
    ]);

};