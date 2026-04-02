#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "User_Db";
    CREATE DATABASE "Admin_Db";
    CREATE DATABASE "Kyc_Db";
    CREATE DATABASE "Wallet_Db";
    CREATE DATABASE "Payment_Db";
    CREATE DATABASE "Transaction_Db";
    CREATE DATABASE "Notification_Db";
    CREATE DATABASE "Rewards_Db";
EOSQL
