# Metis data management GUI: Backend for Frontend

<p class="what_is_metis"><dfn>Metis</dfn> is an open scientific framework, materials data organizer, and collaborative online platform for the nanotechnology research. It was designed for the materials research teams at the physical and virtual laboratories. Metis is an AI-ready solution, aiming to bring the recent advances of computer science into a rather conservative area of new materials development and quality control. Metis currently focuses on the X-ray powder diffraction and atomistic simulations. It was started in 2021 in BASF (Ludwigshafen am Rhein, Germany) by Bernd Hinrichsen and Evgeny Blokhin.</p>

<p align="center"><img src="https://github.com/basf/metis-backend/blob/master/logo.png" width="300" /></p>

**This is the second part of the whole Metis infra: [GUI](https://github.com/basf/metis-gui) &rlarr; [BFF](https://github.com/basf/metis-bff) &rlarr; [backend](https://github.com/basf/metis-backend).**

Whereas the scientific features of Metis are handled with its backend, this BFF provides user and access management, as well as the backend proxy. The scientific data are represented by the abstract _datasource_ objects, managed by GUI users or scripted clients via the standard application programming interface (API).


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

By design, BFF knows very little about the scientific data and is only responsible for the users and access management.

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
