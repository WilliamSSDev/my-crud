from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from app.dependencies import get_session, verify_token
from app.schemas import UserRegister, UserResponse, UserLogin
from app.models import User
from app.auth import authenticate_user, create_token, bcrypt_context
from sqlalchemy.orm import Session
from datetime import timedelta
from app.utils import limiter

auth_route = APIRouter(prefix="/auth", tags=["auth"])

@limiter.limit("5/minute")
@auth_route.post('/register', response_model=UserResponse)
async def register(request: Request, usuario: UserRegister, session: Session = Depends(get_session)):
    
    has_user = session.query(User).filter(User.email==usuario.email).first()

    if has_user:
        raise HTTPException(status_code=400, detail="User already registered.")
    
    senha_criptografada = bcrypt_context.hash(usuario.password)
    novo_usuario = User(name=usuario.name, email=usuario.email, password=senha_criptografada, admin=False)
    session.add(novo_usuario)
    session.commit()
    return novo_usuario


@auth_route.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, response: Response, usuario: UserLogin, session: Session = Depends(get_session)):

    print(request.client.host)

    usuario = authenticate_user(usuario.email, usuario.password, session)

    if not usuario:
        raise HTTPException(status_code=401, detail='User not found')
    
    bearer_token = create_token(usuario.id)
    refresh_token = create_token(usuario.id, timedelta(days=7))

    response.set_cookie(
        key="access_token",
        value=bearer_token,
        httponly=True,
        secure=False,      # for localhost only
        samesite="Lax",  
        path="/"
    )

    return {"access_token": bearer_token, "refresh_token": refresh_token, "token_type": 'Bearer '}

@auth_route.post("/login-form")
async def login_form(user: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):

    usuario = authenticate_user(user.username, user.password, session)

    if not usuario:
        raise HTTPException(status_code=401, detail='User not found')
    
    bearer_token = create_token(usuario.id)
    refresh_token = create_token(usuario.id, timedelta(days=7))
    
    return {"access_token": bearer_token, "refresh_token": refresh_token, "token_type": 'Bearer '}

@limiter.limit("5/minute")
@auth_route.post(path="/refresh")
async def use_refresh_token(request: Request, usuario: User = Depends(verify_token)):

    # Get user ID
    user_id = usuario.id

    # Wheter token is valid then create another token
    access_token = create_token(user_id, timedelta(minutes=30))
    return {
        "access_token": access_token,
        "token_type": "Bearer "
    }

@auth_route.post("/protected")
async def protected(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        return {"error": "not authenticated"}

    return {"message": "you are authenticated"}