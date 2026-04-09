from fastapi import FastAPI
from app.routes.auth import auth_route
from app.routes.user import user_route
from fastapi.middleware.cors import CORSMiddleware
from app.utils import limiter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allows all (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_route)
app.include_router(user_route)

app.state.limiter = limiter

@app.get('/')
def root():

    print(f"API IS WORKING FINE!!")

    return {'message': 'Everything working till now'}
