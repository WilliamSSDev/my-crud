from sqlalchemy.orm import Session
from app.models import User
from typing import Optional
from datetime import timezone, timedelta,datetime
from jose import jwt, JWTError
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES'))

def create_token(id_usuario, expiration: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    expiration_time = datetime.now(timezone.utc) + expiration
    dict_info = {"sub": str(id_usuario), "exp": expiration_time}
    jwt_codificado = jwt.encode(dict_info, SECRET_KEY, ALGORITHM)
    return jwt_codificado

def authenticate_user(email, senha, session: Session) -> Optional[User]:

    usuario = session.query(User).filter(User.email==email).first()

    if not usuario:
        return None
    
    hash = usuario.password
    is_pass_correct = bcrypt_context.verify(senha, hash)

    if not is_pass_correct:
        return None
    
    return usuario


    