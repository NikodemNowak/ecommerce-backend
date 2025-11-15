exports.seed = async function (knex) {
  await knex('categories').del()

  return knex('categories').insert([
    { id: 1, name: 'Elektronika' },
    { id: 2, name: 'Książki' },
    { id: 3, name: 'Dom i ogród' },
    { id: 4, name: 'Odzież' },
    { id: 5, name: 'Zabawki' },
  ])
}
