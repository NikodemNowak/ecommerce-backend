export async function seed(knex) {
  await knex('statuses').del()

  return knex('statuses').insert([
    { id: 1, name: 'NIEZATWIERDZONE' },
    { id: 2, name: 'ZATWIERDZONE' },
    { id: 3, name: 'ANULOWANE' },
    { id: 4, name: 'ZREALIZOWANE' },
  ])
}
