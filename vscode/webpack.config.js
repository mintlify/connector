//@ts-check

'use strict';

const execFile = require('child_process').execFile;
const path = require('path');
const { join } = path;
// eslint-disable-next-line @typescript-eslint/naming-convention
const { ESBuildMinifyPlugin } = require('esbuild-loader');
// eslint-disable-next-line @typescript-eslint/naming-convention
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const JSON5 = require('json5');
const { parse } = JSON5;
// eslint-disable-next-line @typescript-eslint/naming-convention
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const { ProvidePlugin } = webpack;

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

async function resolveTSConfig(configFile) {
	const data = await new Promise((resolve, reject) => {
		execFile(
			'yarn',
			['tsc', `-p ${configFile}`, '--showConfig'],
			{ cwd: __dirname, encoding: 'utf8', shell: true },
			function (error, stdout, stderr) {
				if (error !== null) {
					reject(error);
				}
				resolve(stdout);
			},
		);
	});

	const index = data.indexOf('{\n');
	const endIndex = data.indexOf('Done in');
	const substr = data.substring(index, endIndex > index ? endIndex : undefined);
	const json = parse(substr);
	return json;
}

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @param {{ esbuild?: boolean; }} env
 * @param { WebpackConfig['entry'] } entry
 * @returns { Promise<WebpackConfig> }
 */
 async function getWebviewConfig(mode, env, entry) {
	const basePath = join(__dirname, 'webviews');

	/**
	 * @type WebpackConfig['plugins'] | any
	 */
	const plugins = [
		new ForkTsCheckerPlugin({
			async: false,
			formatter: 'basic',
			typescript: {
				configFile: join(__dirname, 'tsconfig.webviews.json'),
			},
		}),
	];

	return {
		name: 'webviews',
		entry: entry,
		mode: mode,
		target: 'web',
		devtool: mode !== 'production' ? 'source-map' : undefined,
		output: {
			filename: '[name].js',
			path: path.resolve(__dirname, 'dist'),
		},
		optimization: {
			minimizer: [
				// @ts-ignore
				env.esbuild
					? new ESBuildMinifyPlugin({
						format: 'cjs',
						minify: true,
						treeShaking: true,
						// Keep the class names
						keepNames: true,
						target: 'es2019',
					})
					: new TerserPlugin({
						extractComments: false,
						parallel: true,
						terserOptions: {
							ecma: 2019,
							// eslint-disable-next-line @typescript-eslint/naming-convention
							keep_classnames: /^AbortSignal$/,
							module: true,
						},
					}),
			],
		},
		module: {
			rules: [
				{
					exclude: /node_modules/,
					include: [basePath, join(__dirname, 'src')],
					test: /\.tsx?$/,
					use: env.esbuild
						? {
							loader: 'esbuild-loader',
							options: {
								loader: 'tsx',
								target: 'es2019',
								tsconfigRaw: await resolveTSConfig(join(__dirname, 'tsconfig.webviews.json')),
							},
						}
						: {
							loader: 'ts-loader',
							options: {
								configFile: join(__dirname, 'tsconfig.webviews.json'),
								experimentalWatchApi: true,
								transpileOnly: true,
							},
						},
				},
				{
					test: /\.css/,
					use: ['style-loader', 'css-loader', 'postcss-loader'],
				},
				{
					test: /\.svg/,
					use: ['svg-inline-loader'],
				},
			],
		},
    resolveLoader: {
      modules: [
          path.join(__dirname, 'node_modules')
      ]
    },
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.svg'],
      modules: [
        path.join(__dirname, 'node_modules')
      ]
		},
		plugins: plugins,
	};
}

async function getExtensionConfig(target, mode, env) {
  const basePath = join(__dirname, 'src');

	/**
	 * @type WebpackConfig['plugins'] | any
	 */
	const plugins = [
		new ForkTsCheckerPlugin({
			async: false,
			formatter: 'basic',
			typescript: {
				configFile: join(__dirname, target === 'webworker' ? 'tsconfig.browser.json' : 'tsconfig.json'),
			},
		})
	];

  if (target === 'webworker') {
		plugins.push(new ProvidePlugin({
			process: join(
				__dirname,
				'node_modules',
				'process',
				'browser.js')
		}));
	}
  const entry = {
		extension: './src/extension.ts',
	};

  return {
    name: `extension:${target}`,
    entry,
    mode,
    target,
    devtool: mode !== 'production' ? 'source-map' : undefined,
    output: {
			path: target === 'webworker' ? join(__dirname, 'dist', 'browser') : join(__dirname, 'dist'),
			libraryTarget: 'commonjs2',
			filename: '[name].js',
			chunkFilename: 'feature-[name].js',
		},
    externals: {
      vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
      // modules added here also need to be added in the .vscodeignore file
    },
    resolve: {
      // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader'
            }
          ]
        }
      ]
    },
    infrastructureLogging: {
      level: "log", // enables logging required for problem matchers
    }
  };
}

module.exports =
	/**
	 * @param {{ esbuild?: boolean; } | undefined } env
	 * @param {{ mode: 'production' | 'development' | 'none' | undefined; }} argv
	 * @returns { Promise<WebpackConfig[]> }
	 */
	async function (env, argv) {
		const mode = argv.mode || 'none';

		env = {
			esbuild: false,
			...env,
		};

		// @ts-ignore
		return Promise.all([
			getExtensionConfig('node', mode, env),
			getExtensionConfig('webworker', mode, env),
			getWebviewConfig(mode, env, {
				'webviewActivityBar': './webviews/activityBarWebview/index.ts'
			}),
		]);
	};
