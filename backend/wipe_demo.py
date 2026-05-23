import sqlite3
import sys

db_path = "C:/Kaycris/Inventory/backend/inventory.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get demouser ID
cursor.execute("SELECT id FROM users WHERE username = 'demouser'")
row = cursor.fetchone()
if not row:
    print("demouser not found")
    sys.exit(0)

user_id = row[0]

# Get shops for demouser
cursor.execute("SELECT id FROM shops WHERE owner_id = ?", (user_id,))
shop_ids = [r[0] for r in cursor.fetchall()]

if not shop_ids:
    print("No shops found for demouser.")
else:
    shop_ids_tuple = tuple(shop_ids)
    if len(shop_ids) == 1:
        shop_ids_str = f"({shop_ids[0]})"
    else:
        shop_ids_str = str(shop_ids_tuple)
        
    # Delete transactions
    cursor.execute(f"DELETE FROM transactions WHERE shop_id IN {shop_ids_str}")
    # Delete products
    cursor.execute(f"DELETE FROM products WHERE shop_id IN {shop_ids_str}")
    # Delete shops
    cursor.execute(f"DELETE FROM shops WHERE owner_id = ?", (user_id,))
    
    # Also reset shop_id for the owner and any staff assigned to these shops
    cursor.execute(f"UPDATE users SET shop_id = NULL WHERE shop_id IN {shop_ids_str}")

conn.commit()
print("Wiped shops, products, and transactions for demouser!")
conn.close()
