const pkg = require('./package')
const {
    VueLoaderPlugin
} = require('vue-loader')

module.exports = {
    mode: 'universal',
    /*
     ** Headers of the page
     */
    head: {
        title: pkg.name,
        link: [
            {
                rel: 'icon',
                type: 'image/x-icon',
                href: '/favicon.ico'
            }
        ],
        meta: [{
                charset: 'utf-8'
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                hid: 'description',
                name: 'description',
                content: pkg.description
            }
        ]
    },
    /*
     ** Customize the progress-bar color
     */
    loading: {
        color: '#FFFFFF'
    },

    /*
     ** Global CSS
     */
    css: [
        'element-ui/lib/theme-chalk/index.css'
    ],

    /*
     ** Plugins to load before mounting the App
     */
    plugins: [
        '@/plugins/global',
        {
            src:'@/plugins/element-ui'
        },
        {
            src: '@/plugins/waterfall',
            ssr: false
        }, {
            src: '@/plugins/lazy',
            ssr: false
        }
    ],

    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://github.com/nuxt-community/axios-module#usage
        '@nuxtjs/axios'
    ],
    /*
     ** Axios module configuration
     */
    axios: {
        // See https://github.com/nuxt-community/axios-module#options
        credentials:true
    },

    /*
     ** Build configuration
     */
    build: {
        /*
         ** You can extend webpack config here
         */
        analyze: {
            analyzerMode: 'static'
        },
		babel: {
            "presets": ["env",'vue-app'],
            plugins: [['component', [
                {
                  'libraryName': 'element-ui',
                  'styleLibraryName': 'theme-chalk'
                },
                'transform-async-to-generator',
                'transform-runtime'
            ]]],
            comments: false
        },
        extend(config, ctx) {
            // Run ESLint on save
            if (ctx.isDev && ctx.isClient) {
                config.module.rules.push({
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /(node_modules)/
                })
            }
        },
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'img/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'media/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'fonts/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.[sc|c]ss$/,
                loaders: ['style', 'css', 'sass']
            }
        ],
        plugins: [
            new VueLoaderPlugin(),
        ]
    }
}
