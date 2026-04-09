from sqlalchemy import create_engine, Column, String, Integer, Boolean, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import DateTime

db = create_engine("sqlite:///banco.db")

Base = declarative_base()

class User(Base):

    __tablename__ = 'usuarios'

    id = Column("id", Integer, nullable=False, autoincrement=True, primary_key=True)
    name = Column("name", String)
    email = Column("email", String, nullable=False)
    password = Column("password", String)
    admin = Column("admin", Boolean, default=False)
    deleted_at = Column(DateTime, nullable=True)


    def __init__(self, name, email, password, admin=False):

        self.name = name
        self.email = email
        self.password = password
        self.admin = admin

    # class Config:
    #     from_attributes = True

if __name__ == '__main__':

    Base.metadata.create_all(bind=db)



    


