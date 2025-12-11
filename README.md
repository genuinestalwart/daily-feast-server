# Daily Feast | Server

> Production-ready backend for a modern food delivery platform. Designed for scalability, clean API design, and smooth integration with modern web frontends.

## Technologies Used

- NestJS
- TypeScript
- Auth0
- Prisma
- PostgreSQL

## Run Locally

1. Clone the project and install dependencies:

    ```bash
    git clone https://github.com/genuinestalwart/daily-feast-server.git
    cd daily-feast-server
    npm i
    ```

2. Create a `.env` file in the root directory and add the following environment variables:

    ```env
    # Set the environment to "development" or "production"
    NODE_ENV="development"
    AUTH0_CLIENT_ID="your_auth0_client_id"
    AUTH0_CLIENT_SECRET="your_auth0_client_secret"
    AUTH0_DOMAIN="your_auth0_domain"
    AUTH0_IDENTIFIER="your_auth0_identifier"
    AUTH0_TENANT="your_auth0_tenant"
    DATABASE_URL="your_database_url"
    ```

3. Create users in Auth0 based on `data/restaurants.json` and roles based on `src/common/constants/roles.constant.ts`. Assign appropriate roles to the users. Replace the `id` fields in `data/restaurants.json` and the `restaurant_id` fields in `data/menuItems.json` with the Auth0 user IDs.

4. Prepare the database with dummy data:

    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

5. Start the development server:

    ```bash
    npm run start:dev
    ```

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
