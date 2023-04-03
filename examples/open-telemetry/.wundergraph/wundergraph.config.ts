import { configureWunderGraphApplication, cors, introspect, templates } from '@wundergraph/sdk';
import server from './wundergraph.server';
import operations from './wundergraph.operations';

const spacex = introspect.graphql({
	apiNamespace: 'spacex',
	url: 'https://spacex-api.fly.dev/graphql/',
});

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
	apis: [spacex],
	options: {
		telemetry: {
			otelEnabled: true,
			otelExporterHttpEndpoint: '',
			otelExporterJaegerEndpoint: 'http://localhost:14268/api/traces',
		},
	},
	server,
	operations,
	codeGenerators: [
		{
			templates: [
				// use all the typescript react templates to generate a client
				...templates.typescript.all,
			],
		},
	],
	cors: {
		...cors.allowAll,
		allowedOrigins: [],
	},
	security: {
		enableGraphQLEndpoint: true,
	},
});