//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
const { spawnSync } = require('child_process');
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CspHtmlPlugin = require('csp-html-webpack-plugin');
const esbuild = require('esbuild');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const JSON5 = require('json5');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { WebpackError } = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports =
	/**
	 * @param {{ analyzeBundle?: boolean; analyzeDeps?: boolean; esbuild?: boolean; squoosh?: boolean } | undefined } env
	 * @param {{ mode: 'production' | 'development' | 'none' | undefined }} argv
	 * @returns { WebpackConfig[] }
	 */
	function (env, argv) {
		const mode = argv.mode || 'none';

		env = {
			analyzeBundle: false,
			analyzeDeps: false,
			esbuild: true,
			squoosh: true,
			...env,
		};

		return [
			getExtensionConfig('node', mode, env),
			// getExtensionConfig('webworker', mode, env), Todo - add back in to support web
			getWebviewConfig(mode, env, {
				'webviewActivityBar': './webviews/activityBarWebview/index.ts'
			})
		];
	};

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @param {{ esbuild?: boolean; }} env
 * @param { WebpackConfig['entry'] } entry
 * @returns { WebpackConfig }
 */
function getWebviewConfig(mode, env, entry) {
	const basePath = path.join(__dirname, 'webviews');

	/**
	 * @type WebpackConfig['plugins'] | any
	 */
	const plugins = [
		new ForkTsCheckerPlugin({
			async: false,
			formatter: 'basic',
			typescript: {
				configFile: path.join(__dirname, 'tsconfig.webviews.json'),
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
						target: 'es2020',
					})
					: new TerserPlugin({
						extractComments: false,
						parallel: true,
						terserOptions: {
							ecma: 2020,
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
					include: [basePath, path.join(__dirname, 'src')],
					test: /\.tsx?$/,
					use: env.esbuild
						? {
							loader: 'esbuild-loader',
							options: {
								loader: 'tsx',
								target: 'es2020',
								tsconfigRaw: resolveTSConfig(path.join(__dirname, 'tsconfig.webviews.json')),
							},
						}
						: {
							loader: 'ts-loader',
							options: {
								configFile: path.join(__dirname, 'tsconfig.webviews.json'),
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
		resolve: {
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.svg']
		},
		plugins: plugins,
	};
}

/**
 * @param { 'node' | 'webworker' } target
 * @param { 'production' | 'development' | 'none' } mode
 * @param {{ analyzeBundle?: boolean; analyzeDeps?: boolean; esbuild?: boolean; squoosh?: boolean } | undefined } env
 * @returns { WebpackConfig }
 */
function getExtensionConfig(target, mode, env) {
	/**
	 * @type WebpackConfig['plugins'] | any
	 */
	const plugins = [
		new CleanPlugin({ cleanOnceBeforeBuildPatterns: ['!dist/webviews/**'] }),
		new ForkTsCheckerPlugin({
			async: false,
			formatter: 'basic',
			typescript: {
				configFile: path.join(__dirname, target === 'webworker' ? 'tsconfig.browser.json' : 'tsconfig.json'),
			},
		}),
	];

	if (env?.analyzeDeps) {
		plugins.push(
			new CircularDependencyPlugin({
				cwd: __dirname,
				exclude: /node_modules/,
				failOnError: false,
				onDetected: function ({ module: _webpackModuleRecord, paths, compilation }) {
					if (paths.some(p => p.includes('container.ts'))) return;

					// @ts-ignore
					compilation.warnings.push(new WebpackError(paths.join(' -> ')));
				},
			}),
		);
	}

	if (env?.analyzeBundle) {
		plugins.push(new BundleAnalyzerPlugin({ analyzerPort: 'auto' }));
	}

	return {
		name: `extension:${target}`,
		entry: {
			extension: './src/extension.ts',
		},
		mode: mode,
		target: target,
		devtool: 'source-map',
		output: {
			path: target === 'webworker' ? path.join(__dirname, 'dist', 'browser') : path.join(__dirname, 'dist'),
			libraryTarget: 'commonjs2',
			filename: 'gitlens.js',
			chunkFilename: 'feature-[name].js',
		},
		optimization: {
			minimizer: [
				new TerserPlugin(
					env?.esbuild
						? {
								minify: TerserPlugin.esbuildMinify,
								terserOptions: {
									// @ts-ignore
									drop: ['debugger'],
									format: 'cjs',
									minify: true,
									treeShaking: true,
									// Keep the class names otherwise @log won't provide a useful name
									keepNames: true,
									target: 'es2020',
								},
						  }
						: {
								extractComments: false,
								parallel: true,
								terserOptions: {
									ecma: 2020,
									// Keep the class names otherwise @log won't provide a useful name
									keep_classnames: true,
									module: true,
								},
						  },
				),
			],
			splitChunks:
				target === 'webworker'
					? false
					: {
							// Disable all non-async code splitting
							chunks: () => false,
							cacheGroups: {
								default: false,
								vendors: false,
							},
					  },
		},
		externals: {
			vscode: 'commonjs vscode',
		},
		module: {
			rules: [
				{
					exclude: /\.d\.ts$/,
					include: path.join(__dirname, 'src'),
					test: /\.tsx?$/,
					use: env?.esbuild
						? {
								loader: 'esbuild-loader',
								options: {
									implementation: esbuild,
									loader: 'ts',
									target: ['es2020', 'chrome91', 'node14.16'],
									tsconfigRaw: resolveTSConfig(
										path.join(
											__dirname,
											target === 'webworker' ? 'tsconfig.browser.json' : 'tsconfig.json',
										),
									),
								},
						  }
						: {
								loader: 'ts-loader',
								options: {
									configFile: path.join(
										__dirname,
										target === 'webworker' ? 'tsconfig.browser.json' : 'tsconfig.json',
									),
									experimentalWatchApi: true,
									transpileOnly: true,
								},
						  },
				},
			],
		},
		resolve: {
			alias: {
				'@env': path.resolve(__dirname, 'src', 'env', target === 'webworker' ? 'browser' : target),
				// This dependency is very large, and isn't needed for our use-case
				// tr46: path.resolve(__dirname, 'patches', 'tr46.js'),
			},
			fallback: target === 'webworker' ? { path: require.resolve('path-browserify') } : undefined,
			mainFields: target === 'webworker' ? ['browser', 'module', 'main'] : ['module', 'main'],
			extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
		},
		plugins: plugins,
		infrastructureLogging: {
			level: 'log', // enables logging required for problem matchers
		},
		stats: {
			preset: 'errors-warnings',
			assets: true,
			colors: true,
			env: true,
			errorsCount: true,
			warningsCount: true,
			timings: true,
		},
	};
}

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @param {{ analyzeBundle?: boolean; analyzeDeps?: boolean; esbuild?: boolean; squoosh?: boolean } | undefined } env
 * @returns { CspHtmlPlugin }
 */
function getCspHtmlPlugin(mode, env) {
	const cspPlugin = new CspHtmlPlugin(
		{
			'default-src': "'none'",
			'img-src': ['#{cspSource}', 'https:', 'data:'],
			'script-src':
				mode !== 'production'
					? ['#{cspSource}', "'nonce-#{cspNonce}'", "'unsafe-eval'"]
					: ['#{cspSource}', "'nonce-#{cspNonce}'"],
			'style-src': ['#{cspSource}', "'nonce-#{cspNonce}'", "'unsafe-hashes'"],
			'font-src': ['#{cspSource}'],
		},
		{
			enabled: true,
			hashingMethod: 'sha256',
			hashEnabled: {
				'script-src': true,
				'style-src': true,
			},
			nonceEnabled: {
				'script-src': true,
				'style-src': true,
			},
		},
	);
	// Override the nonce creation so we can dynamically generate them at runtime
	// @ts-ignore
	cspPlugin.createNonce = () => '#{cspNonce}';

	return cspPlugin;
}

/**
 * @param { 'production' | 'development' | 'none' } mode
 * @param {{ analyzeBundle?: boolean; analyzeDeps?: boolean; esbuild?: boolean; squoosh?: boolean } | undefined } env
 * @returns { ImageMinimizerPlugin.Generator<any> }
 */
function getImageMinimizerConfig(mode, env) {
	/** @type ImageMinimizerPlugin.Generator<any> */
	// @ts-ignore
	return env.squoosh
		? {
				type: 'asset',
				implementation: ImageMinimizerPlugin.squooshGenerate,
				options: {
					encodeOptions: {
						webp: {
							// quality: 90,
							lossless: 1,
						},
					},
				},
		  }
		: {
				type: 'asset',
				implementation: ImageMinimizerPlugin.imageminGenerate,
				options: {
					plugins: [
						[
							'imagemin-webp',
							{
								lossless: true,
								nearLossless: 0,
								quality: 100,
								method: mode === 'production' ? 4 : 0,
							},
						],
					],
				},
		  };
}

/**
 * @param { string } name
 * @param { boolean } plus
 * @param { 'production' | 'development' | 'none' } mode
 * @param {{ analyzeBundle?: boolean; analyzeDeps?: boolean; esbuild?: boolean; squoosh?: boolean } | undefined } env
 * @returns { HtmlPlugin }
 */
function getHtmlPlugin(name, plus, mode, env) {
	return new HtmlPlugin({
		template: plus ? path.join('plus', name, `${name}.html`) : path.join(name, `${name}.html`),
		chunks: [name],
		filename: path.join(__dirname, 'dist', 'webviews', `${name}.html`),
		inject: true,
		scriptLoading: 'module',
		inlineSource: mode === 'production' ? '.css$' : undefined,
		minify:
			mode === 'production'
				? {
						removeComments: true,
						collapseWhitespace: true,
						removeRedundantAttributes: false,
						useShortDoctype: true,
						removeEmptyAttributes: true,
						removeStyleLinkTypeAttributes: true,
						keepClosingSlash: true,
						minifyCSS: true,
				  }
				: false,
	});
}

class InlineChunkHtmlPlugin {
	constructor(htmlPlugin, patterns) {
		this.htmlPlugin = htmlPlugin;
		this.patterns = patterns;
	}

	getInlinedTag(publicPath, assets, tag) {
		if (
			(tag.tagName !== 'script' || !(tag.attributes && tag.attributes.src)) &&
			(tag.tagName !== 'link' || !(tag.attributes && tag.attributes.href))
		) {
			return tag;
		}

		let chunkName = tag.tagName === 'link' ? tag.attributes.href : tag.attributes.src;
		if (publicPath) {
			chunkName = chunkName.replace(publicPath, '');
		}
		if (!this.patterns.some(pattern => chunkName.match(pattern))) {
			return tag;
		}

		const asset = assets[chunkName];
		if (asset == null) {
			return tag;
		}

		return { tagName: tag.tagName === 'link' ? 'style' : tag.tagName, innerHTML: asset.source(), closeTag: true };
	}

	apply(compiler) {
		let publicPath = compiler.options.output.publicPath || '';
		if (publicPath && !publicPath.endsWith('/')) {
			publicPath += '/';
		}

		compiler.hooks.compilation.tap('InlineChunkHtmlPlugin', compilation => {
			const getInlinedTagFn = tag => this.getInlinedTag(publicPath, compilation.assets, tag);
			const sortFn = (a, b) => (a.tagName === 'script' ? 1 : -1) - (b.tagName === 'script' ? 1 : -1);
			this.htmlPlugin.getHooks(compilation).alterAssetTagGroups.tap('InlineChunkHtmlPlugin', assets => {
				assets.headTags = assets.headTags.map(getInlinedTagFn).sort(sortFn);
				assets.bodyTags = assets.bodyTags.map(getInlinedTagFn).sort(sortFn);
			});
		});
	}
}

/**
 * @param { string } configFile
 * @returns { string }
 */
function resolveTSConfig(configFile) {
	const result = spawnSync('yarn', ['tsc', `-p ${configFile}`, '--showConfig'], {
		cwd: __dirname,
		encoding: 'utf8',
		shell: true,
	});

	const data = result.stdout;
	const start = data.indexOf('{');
	const end = data.lastIndexOf('}') + 1;
	const json = JSON5.parse(data.substring(start, end));
	return json;
}
