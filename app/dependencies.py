from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends, HTTPException
from app.models import db, User
from jose import jwt, JWTError
from app.auth import SECRET_KEY, ALGORITHM
from fastapi.security import OAuth2PasswordBearer

aouth2_schema = OAuth2PasswordBearer(tokenUrl="auth/login-form")

def get_session():

    Session = sessionmaker(bind=db)

    session = Session()

    try:
        yield session
    finally:
        session.close()

def verify_token(token: str = Depends(aouth2_schema), session: Session = Depends(get_session)):
    try:
        dict_info = jwt.decode(token, SECRET_KEY, ALGORITHM)
        user_id = int(dict_info.get('sub'))
        
    except JWTError:
        raise HTTPException(status_code=401, detail=f'Not authorized.')
    
    usuario = session.query(User).filter(User.id==user_id).first()
    return usuario