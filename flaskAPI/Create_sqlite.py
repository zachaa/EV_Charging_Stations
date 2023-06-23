import sqlite3
import pandas as pd
from sqlalchemy import Column, Integer, Float, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

Base = declarative_base()

class ReducedData(Base):
    __tablename__ = 'reduced_data'
    id = Column(Integer, primary_key=True)
    Title = Column(String)
    AddressLine1 = Column(String)
    Town = Column(String)
    StateOrProvince = Column(String)
    Postcode = Column(String)
    Latitude = Column(Float)
    Longitude = Column(Float)
    ConnectionTypeIDs = Column(String)
    PowerKWs = Column(String)
    CurrentTypeIDs = Column(String)
    OperatorID = Column(Integer)
    UsageTypeID = Column(Integer)
    UsageCost = Column(String)
    NumberOfPoints = Column(Integer)
    StatusTypeID = Column(Integer)
    LUnknownCount = Column(Integer)
    L1Count = Column(Integer)
    L2Count = Column(Integer)
    L3Count = Column(Integer)
    AddressLine2 = Column(String)
    DatePlanned = Column(String)

class SQLiteManager:
    def __init__(self, database_path):
        self.database_path = database_path
        self.engine = create_engine(f"sqlite:///{self.database_path}")
        self.session = sessionmaker(bind=self.engine)()

    def create_database(self):
        Base.metadata.create_all(self.engine)

    def create_table(self):
        pass  # Table creation is handled by the mapped class definition

    def import_csv_to_table(self, csv_path):
        csv_data = pd.read_csv(csv_path)
        csv_data.to_sql("reduced_data", self.engine, if_exists='append', index=False)

    def execute_query(self, query):
        self.session.execute(query)
        self.session.commit()

    def close_connection(self):
        self.session.close()

# Usage example
database_path = "data/reduced_data.sqlite"
csv_path = "data/reduced_data.csv"

manager = SQLiteManager(database_path)
manager.create_database()
manager.import_csv_to_table(csv_path)

# Example query
# results = manager.session.query(ReducedData).filter_by(Town='YourTown').all()
# for result in results:
#     print(result.Title, result.AddressLine1)

manager.close_connection()
