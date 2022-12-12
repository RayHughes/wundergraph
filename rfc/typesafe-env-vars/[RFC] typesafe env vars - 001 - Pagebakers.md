# RFC - Typesafe environment variables

This RFC proposes a standard for defining and using type-safe environment variables in WunderGraph. The goal of this proposal is to provide a consistent and type-safe way to access and use environment variables, while also allowing for easy validation and error-handling.

## Motivation

The use of environment variables can be error-prone due to their lack of type safety. It's easy to overlook missing environment variables and there is no built-in autocompletion when accessing `process.env` or `EnvironmentVariable`.

Problems that this RFC tries to solve are;

- Easy to forget configuring environment variables.
- There is no validation to make sure variables contain the correct value.
- Hard to debug which variables are missing.
- No autocomplete support.

## Solution

A new `wundergraph.env.ts` configuration where all available environment variables can be configured. The configuration supports a schema, so the values can be validated.

### Configuration

```ts
import { z } from 'zod';
import { configureEnv } from '@wundergraph/sdk';

const schema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	OAUTH_CLIENT_ID: z.string().describe('OAuth Client ID'),
	SQLITE_DB: z.string().optional(),
});

export default configureEnv(schema);
```

configureEnvironment accepts any schema definition that supports a `safeParse` method. It parses `process.env` and also adds the built-in WG\_ variables to the object. If a required env var is missing the validator will throw an error and the WunderNode will fail to run on production, and will be in error state in dev mode, untill the variable has been configured.

| Variable name        | Description                                             | Default value           |
| -------------------- | ------------------------------------------------------- | ----------------------- |
| `WG_LOG_LEVEL`       | The log level of the `WunderNode`/`WunderGraph Server`. | `info`                  |
| `WG_NODE_URL`        | The internal URL of the `WunderNode`.                   | `http://localhost:9991` |
| `WG_PUBLIC_NODE_URL` | The publicly available URL of the `WunderNode`.         | `http://localhost:9991` |
| `WG_NODE_HOST`       | The host of the `WunderNode`.                           | `127.0.0.1`             |
| `WG_NODE_PORT`       | The port of the `WunderNode`.                           | `9991`                  |
| `WG_SERVER_URL`      | The URL of the `WunderGraph Server`.                    | `http://localhost:9992` |
| `WG_SERVER_HOST`     | The host of the `WunderGraph Server`.                   | `127.0.0.1`             |
| `WG_SERVER_PORT`     | The port of the `WunderGraph Server`.                   | `9992`                  |

### Usage

Instead of using `process.env.VAR` we now have typesafe access to our environment variables like so;

```ts
import env from '.wundergraph/wundergraph.env';

env.WG_NODE_URL; // http://localhost:9991
env.OAUTH_CLIENT_ID;

new EnvironmentVariable(env.WG_SERVER_PORT, '9992');
```

### configureEnv

```ts
const configureEnv = (schema: AnySchema) => {
	const _env = schema.safeParse(process.env);

	if (!_env.success) {
		console.error(
			'❌ Invalid environment variables:\n',
			...formatErrors(_env.error.format()) // do some nice formatting for the console output
		);
		throw new Error('Invalid environment variables');
	}

	return {
		...env.data,
		...wgEnv,
	};
};
```

### Questions

Should we also support defining client side variables? (And NEXT_PUBLIC support?), and throwing errors when server ENV is accessed client side?