from fastapi import FastAPI
from app.routes.auth import auth_route
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allows all (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_route)

@app.get('/')
def root():

    print(f"API IS WORKING FINE!!")

    return {'message': 'Everything working till now'}
