# Hexagonal architecture

The portfolio domain does not import HTTP, SQL, or generated API types. Inbound HTTP and outbound Postgres are adapters behind ports. A single handler package that talked to SQL would have been smaller, and was rejected so the proficiency rule and the private-repository rule stay testable without a database, in the same shape as the other Go services.
