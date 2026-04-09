from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import verify_token, get_session
from app.models import User

user_route = APIRouter(prefix="/user", tags=['user'])

@user_route.get(path="/me")
async def get_user(usuario: User = Depends(verify_token)):

    return {"message": usuario.id}

@user_route.delete(path="/{user_id}")
async def delete_user(user_id: int, session: Session = Depends(get_session), usuario: User = Depends(verify_token)):

    if not usuario.admin:

        raise HTTPException(
            status_code=403,
            detail="Admin privileges required."
        )
    
        #Forbidden action: user is not an admin.
    
    # Get user to delete from database.
    usuario = session.query(User).filter(User.id==user_id).first()

    if not usuario:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )
    
    #User has not been found in the database.
    
    elif usuario.admin:
        raise HTTPException(
            status_code=403,
            detail="Admin users cannot be deleted."
        )
    
    session.delete(usuario)
    session.commit()

    return {"message": f"Deleted user {usuario.id} from database."}

async def update_user(user_id, session: Session = Depends(get_session), usuario: User = Depends(verify_token)):

    pass



    

    

