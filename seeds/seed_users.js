import argon2 from 'argon2'

export async function seed(knex) {
  await knex('users').del()

  const hashedPassword = await argon2.hash('admin')
  const hashedUserPassword = await argon2.hash('user')

  await knex('users').insert([
    {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  ])
  await knex('users').insert([
    {
      username: 'user',
      password: hashedUserPassword,
      email: 'user@example.com',
      role: 'USER',
    },
  ])
}
