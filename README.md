# Metis data management GUI: Backend for Frontend

<p align="center"><img src="https://github.com/basf/metis-backend/blob/master/logo.png" width="300" /></p>

**This is the second part of the whole Metis infra: [GUI](https://github.com/basf/metis-gui) &rlarr; [BFF](https://github.com/basf/metis-bff) &rlarr; [backend](https://github.com/basf/metis-backend).**

### Requirements

- `node -v >= 15`
- `npm -v >= 7`
- Postgres (any relatively new)

NB to upgrade `node` you may run `npm install -g n && n lts` and re-start the shell.


## Installation

```bash
cp conf/env.ini.sample conf/env.ini
npm install
npm run db-migrate
npm run db-seed
```


## Running

### For development mode run the following command:

```bash
npm run dev
```


### For production mode run the following command:

```bash
npm run start
```

Configure the development and production settings in `conf/env.ini` file.


## Technical details

![BFF database schema](https://raw.githubusercontent.com/basf/metis-bff/master/bff_schema.png "BFF Postgres schema")

The BFF database schema is presented above (see `db/migrations` script).

By design, BFF knows nothing about the scientific data and is only responsible for the users and access management.

On top of the `users`, the main concepts mapped onto the database are:

- `datasources` (static data sent to the backend)
- `calculations` (transitions of data into the other data)
- `collections` (groups of the data)

### Proxying

Note, that the non-versioned routes without `/v0` will be redirected _as is_ to the backend.


## API

The docs are generated with the `apidoc`:

```
npm run apidoc
```

and, optionally, `swagger`:

```
npm run apidoc-swagger
```

Also, there is the [Python API client](https://github.com/tilde-lab/metis-client) `metis-client` (on PyPI) consuming all the public Metis API methods.


## License

Copyright 2021-2023 BASF SE

BSD 3-Clause
