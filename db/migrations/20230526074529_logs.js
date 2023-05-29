const {
    LOGS_TABLE,
    USERS_TABLE,
    USER_CALCULATIONS_TABLE,
    USER_COLLECTIONS_TABLE,
    USER_DATASOURCES_TABLE,
} = require('../../services/db');

const LOG_FUNCTION = 'custom_log';
const PREFIX_TRIGGER = 'tg_log_';

const tables = [
    USERS_TABLE,
    USER_CALCULATIONS_TABLE,
    USER_DATASOURCES_TABLE,
    USER_COLLECTIONS_TABLE,
];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable(LOGS_TABLE, (table) => {
            table.increments('id');
            table.integer('user_id').unsigned().index();
            table.string('type');
            table.jsonb('value');
            table.timestamp('created_at').defaultTo(knex.fn.now()).index();

            table.primary('id', { constraintName: 'pk_logs' });
        })

        .then(() => {
            const query = `
            create or replace function ${LOG_FUNCTION} () returns trigger as $$
            declare
                user_id integer;
                type varchar := lower(tg_table_name);
            begin
                if type = lower('${USERS_TABLE}') then
                    user_id := new.id;
                else
                    user_id := new."user_id";
                end if;
                insert into "${LOGS_TABLE}" ("user_id", "type", "value") values (user_id, type, to_jsonb(new));
                return new;
            end;
            $$ language plpgsql;
            `;

            return knex.schema.raw(query);
        })
        .then(() => {
            const query = tables.reduce((sql, table) => {
                return `${sql}
                create or replace trigger "${PREFIX_TRIGGER}${table}"
                    after insert
                    on "${table}"
                    for each row
                    execute function ${LOG_FUNCTION}();
                `;
            }, '');

            return knex.schema.raw(query);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    const queryDropTriggers = tables.reduce((sql, table) => {
        return `${sql}
            drop trigger if exists "${PREFIX_TRIGGER}${table}" on "${table}";
        `;
    }, '');

    return knex.schema
        .raw(queryDropTriggers)
        .then(() => {
            return knex.schema.raw(`drop function ${LOG_FUNCTION}();`);
        })
        .then(() => knex.schema.dropTable(LOGS_TABLE));
};
