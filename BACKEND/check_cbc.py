from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
load_dotenv()
url = os.getenv('DATABASE_URL')
print('DB URL:', url)
engine = create_engine(url)
with engine.connect() as conn:
    rs = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='cbc_reports'"))
    print('cbc_reports exists:', rs.fetchone() is not None)
    rs = conn.execute(text("SELECT user_email, report_date, hemoglobin, rbc_count, pcv, mcv, wbc_count, platelet_count FROM cbc_reports WHERE user_email='santoshtalekattu@gmail.com' ORDER BY report_date DESC LIMIT 1"))
    print('row:', rs.fetchone())
