CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

insert into
    carts (user_id, created_at, updated_at, status)
values
    (
        uuid_generate_v4 (),
        '2023-03-29',
        '2023-03-29',
        'OPEN'
    ),
    (
        uuid_generate_v4 (),
        '2023-03-30',
        '2023-03-30',
        'ORDERED'
    ),
    (
        uuid_generate_v4 (),
        '2023-03-31',
        '2023-03-31',
        'OPEN'
    );