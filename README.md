# Daily Feast | Server

> Production-ready backend for a modern food delivery platform; built with NestJS, Auth0, Prisma, and PostgreSQL. Designed for scalability, clean API design, and smooth integration with modern web frontends.

## Technologies Used

- NestJS
- TypeScript
- Auth0
- Prisma
- PostgreSQL

## Important Commands

- Customize the `.prettierrc` file and run this to apply changes:

    ```bash
    npx prettier . --write
    ```

- Install _npm-check-updates_ and use its commands to update the node packages:

    ```bash
    npm i -g npm-check-updates
    ncu
    ncu -u
    npm i
    ```

- Run this after every schema changes:

    ```bash
    npx prisma migrate dev --name [name_given_by_you]
    ```

- Add dummy data to database:

    ```bash
    npx prisma db seed
    ```
