#!/bin/sh
set -eu

psql \
  --set=ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=database_name="$POSTGRES_DB" \
  --set=runtime_user="$POSTGRES_RUNTIME_USER" \
  --set=runtime_password="$POSTGRES_RUNTIME_PASSWORD" <<-'SQL'
CREATE ROLE :"runtime_user"
  WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
  PASSWORD :'runtime_password';
ALTER DATABASE :"database_name" OWNER TO :"runtime_user";
GRANT ALL ON SCHEMA public TO :"runtime_user";
SQL
