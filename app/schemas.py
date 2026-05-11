from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserRegister(BaseModel):

    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

class UserLogin(BaseModel):

    email: str
    password: str

class Card(BaseModel):

    front_content: str
    back_content: str

