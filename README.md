# XRPD data management GUI: Backend for Frontend

### Requirements

- `node -v >= 15`
- `npm -v >= 7`
- Postgres (any relatively new)

To upgrade `node` run `npm install -g n && n lts` and re-start shell


## Installation

```bash
cp env.ini.sample env.ini
npm install
node db_seed.js
```


## Running

# For development mode run following command:

```bash
npm run dev
```


# For production mode run following command:

```bash
npm run start
```

Configurate development and production settings in env.ini file.


## License

Copyright 2021-2022 BASF SE

BSD 3-Clause
