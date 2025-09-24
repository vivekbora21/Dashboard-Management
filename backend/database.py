from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

#Database connection
engine = create_engine("mysql+pymysql://root:1234@localhost/react")
Base = declarative_base()
Session = sessionmaker(bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(50))
    last_name = Column(String(50))
    email = Column(String(100), unique=True)
    mobile = Column(String(15), unique=True)
    password = Column(String(100))
    created_at = Column(String(50))


#Create table if not present
Base.metadata.create_all(engine) 

