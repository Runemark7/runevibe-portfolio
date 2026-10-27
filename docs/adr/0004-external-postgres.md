# Postgres stays outside the cluster

The site reads PostgreSQL on a separate VPS. The connection string comes only from `DATABASE_URL` in the environment or in a Kubernetes Secret named by the chart. The cluster is a single small node, so a database inside it would compete for RAM and would tie backups to the cluster. Local development uses the Postgres service in docker-compose, which is not the production database and holds no production credentials.
