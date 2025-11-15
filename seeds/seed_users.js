import argon2 from 'argon2'

export async function seed(knex) {
  await knex('users').del()

  const hashedPassword = await argon2.hash('admin')

  await knex('users').insert([
    {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  ])
}
