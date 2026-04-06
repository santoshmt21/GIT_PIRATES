from app.schemas import UserCreate, ProfileUpdate
from app.database import get_db
from app import crud
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas import UserLogin

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)



@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    return crud.login_user(db=db, user=user)


@router.get("/profile")
def get_profile(gmail: str = Query(...), db: Session = Depends(get_db)):
    return crud.get_profile_by_gmail(db=db, gmail=gmail)


@router.put("/profile")
def update_profile(data: ProfileUpdate, gmail: str = Query(...), db: Session = Depends(get_db)):
    return crud.upsert_profile(db=db, gmail=gmail, data=data)