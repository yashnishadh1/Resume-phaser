import sqlite3

conn = sqlite3.connect('resume_parser.db')
cursor = conn.cursor()

# Add missing columns
try:
    cursor.execute('ALTER TABLE candidates ADD COLUMN applied_role VARCHAR')
    print('Added applied_role column')
except Exception as e:
    print(f'applied_role: {e}')

try:
    cursor.execute("ALTER TABLE candidates ADD COLUMN status VARCHAR DEFAULT 'Pending'")
    print('Added status column')
except Exception as e:
    print(f'status: {e}')

conn.commit()

# Verify
cursor.execute('PRAGMA table_info(candidates)')
print('\nUpdated candidates table schema:')
for row in cursor.fetchall():
    print(f'  {row}')

conn.close()
print('\nDone! Database schema fixed.')
