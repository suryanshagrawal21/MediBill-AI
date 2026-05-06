import psycopg2
import sys

passwords = ["postgres", "admin", "root", "password", ""]
ports = [5432, 5433]
hosts = ["localhost", "127.0.0.1", "::1"]

for host in hosts:
    for port in ports:
        for pwd in passwords:
            try:
                conn = psycopg2.connect(host=host, port=port, user="postgres", password=pwd, dbname="postgres")
                print(f"SUCCESS: host={host}, port={port}, pwd='{pwd}'")
                conn.close()
                sys.exit(0)
            except Exception as e:
                pass
print("ALL FAILED")
