# Environment Variables Documentation

## PORT
- **Description**: The port number on which the server will run.
- **Default Value**: `3000`
- **Example**: `PORT=3000`

## NODE_ENV
- **Description**: Specifies the environment in which the application is running. Common values are `development`, `production`, and `test`.
- **Default Value**: `development`
- **Example**: `NODE_ENV=development`

## DATABASE_URL
- **Description**: The URL for the remote database connection.
- **Example**: `DATABASE_URL=mongodb+srv://username:password@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority`

## DATABASE_LOCAL_URL
- **Description**: The URL for the local database connection.
- **Default Value**: `mongodb://127.0.0.1:27017/auto-lease`
- **Example**: `DATABASE_LOCAL_URL=mongodb://127.0.0.1:27017/auto-lease`

## DATABASE_PASSWORD
- **Description**: The password for the database connection. Typically used in conjunction with `DATABASE_URL`.
- **Example**: `DATABASE_PASSWORD=your_database_password`

## JWT_SECRET
- **Description**: The secret key used for signing JSON Web Tokens (JWT). This should be kept secure and not shared publicly.
- **Example**: `JWT_SECRET=yoursecret`

## JWT_EXPIRES
- **Description**: The duration for which the JWT token is valid.
- **Default Value**: `1h`
- **Examples**:
    - `JWT_EXPIRES=1h` (1 hour)
    - `JWT_EXPIRES=30m` (30 minutes)
    - `JWT_EXPIRES=1d` (1 day)
    - `JWT_EXPIRES=7d` (7 days)

## JWT_COOKIE_EXPIRES_IN
- **Description**: The duration for which the JWT cookie is valid. This value should be a JSON string specifying the duration.
- **Format**: JSON string
- **Default Value**: `{"h":1}`
- **Examples**:
    - `JWT_COOKIE_EXPIRES_IN={"s":30}` (30 seconds)
    - `JWT_COOKIE_EXPIRES_IN={"m":15}` (15 minutes)
    - `JWT_COOKIE_EXPIRES_IN={"h":1}` (1 hour)
    - `JWT_COOKIE_EXPIRES_IN={"d":1}` (1 day)
    - `JWT_COOKIE_EXPIRES_IN={"w":1}` (1 week)
    - `JWT_COOKIE_EXPIRES_IN={"m":1}` (1 month)

## Example `.env` File
Below is an example of how your `.env` file might look with these variables:

```ini
PORT=3000
NODE_ENV=development

DATABASE_URL=
DATABASE_LOCAL_URL=mongodb://127.0.0.1:27017/auto-lease
DATABASE_PASSWORD=

JWT_SECRET=yoursecret
JWT_EXPIRES=1h
JWT_COOKIE_EXPIRES_IN={"h":1}
