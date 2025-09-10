import mysql.connector
from mysql.connector import Error

passwords = ['', 'root', 'password', 'admin', '123456', 'mysql']

for pwd in passwords:
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=pwd
        )
        print(f"✅ SUCCESS: Password is '{pwd}'")
        connection.close()
        break
    except Error as e:
        print(f"❌ Failed with password '{pwd}': {e}")