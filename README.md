# BHIMA-DHIS2

BHIMA-DHIS2 allows you to execute the data import script from BHIMA to DHIS2. Currently, this process is done manually while waiting for automation. Therefore, certain configurations need to be set only in the environment file. An .xls file containing information about the different molecules and their DHIS2 keys is required.

## Prerequisites

First, you need to have a version of [BHIMA](https://github.com/IMA-WorldHealth/bhima) running on your PC.

## Configuration

In the environment file, configure the following variables:

```env
PATH_RUMER_FUNCTION='../bhima/path' -- the path where the rumer function file is located in BHIMA
PATH_DB='../bhima/path' -- the database file
START_DATE='2024-04-01' -- specify the start period
END_DATE='2024-04-31' -- specify the end period

DHIS2_SERVER_URL='https://test.dhis2.com' -- specify the sever url
DHIS2_USERNAME='username'
DHIS2_PASSWORD='password'

DB_PORT=3306
# DB_HOST is the MySQL server Host
DB_HOST='localhost'
# DB_USER is the MYSQL client user to connect to the server with
DB_USER='db_user'
# DB_PASS is the password for the MySQL user
DB_PASS='db_password'
# DB_NAME is the database name to connect to.
DB_NAME='database'
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```

This project was created using `bun init` in bun v1.0.29. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
