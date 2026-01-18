# Brighte Eats

This project is a simple application to collect expressions of interest for a new product and allow internal teams to view and manage those leads through a dashboard.
## How to Run

1. **Clone the project:**

    ```sh
    git clone <repository-url>
    cd <project-directory>
    ```

2. **Set up environment variables (Web)**
   
   copy the example dist file
   ```sh
    cp .env.dist .env

    ```


3. **Start the application using Docker Compose:**

    ```sh
    docker-compose up --build
    ```

# End points

Web: http://localhost:5173/

API : http://localhost:3000/graphql

# example graphql operation

Mutations
```
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    id
    name
    email
    mobile
    postcode
    services
    createdAt
  }
}

```
Variables 
```
  "input": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobile": "0400123456",
    "postcode": "2000",
    "services": ["DELIVERY", "PICK_UP"]
  }
}


```

lead

```query Lead($leadId: ID!) {
  lead(id: $leadId) {
    id
    name
    email
    mobile
    postcode
    services
    createdAt
  }
}
variable
{
  "leadId": "1"
}
```

Leads 
```
query Leads {
  leads {
    id
    name
    email
    mobile
    postcode
    services
    createdAt
  }
}

filters

  "filter": {
    "email": "john.doe@example.com"
  }
}

{
  "filter": {
    "postcode": "2000"
  }
}

```




# How to Run Tests

To run the tests, use the following command:

```sh
npm run test

```
## How to Run Code Coverage
```sh
npm run coverage

```

## Note
The frontend implementation is intentionally minimal and built for demonstration purposes only. As a result, no  tests have been added for the frontend.

SQLite is used for both the application and test databases for simplicity and portability.

AI-assisted tools were used during development to improve productivity and code quality.
