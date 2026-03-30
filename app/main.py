from fastapi import FastAPI

app = FastAPI()


app.get('/')
def hello_world():

    print(f"API IS WORKING FINE!!")

    return {'message': 'Everything working till now'}