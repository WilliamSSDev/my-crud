from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from app.dependencies import verify_token, get_session
from app.models import User, Card as CardM, Difficulty, get_next_review
from app.schemas import Card
from datetime import datetime, timezone, timedelta

cards_route = APIRouter(prefix="/cards", tags=['cards'])


@cards_route.post(path="/add_card")
def add_card(card: Card, usuario: User = Depends(verify_token), session: Session = Depends(get_session)):

    # next_review = datetime.now(timezone.utc) + timedelta(days=2)

    new_card = CardM(
        front_content=card.front_content,
        back_content=card.back_content,
        next_review=datetime.now(timezone.utc),
        last_reviewed=datetime.now(timezone.utc),
        difficulty=Difficulty.EASY,
        interval=1,
        user_id=usuario.id
    )

    session.add(new_card)
    session.commit()

@cards_route.delete(path="/delete_card/{card_id}")
def delete_cards(card_id, usuario: User = Depends(verify_token), session: Session = Depends(get_session)):

    found_card = session.query(CardM).filter_by(id=card_id).first()

    if not found_card:
        return {"message": 'Card was not found'}

    elif not found_card.user_id:
        session.delete(found_card)
        session.commit()
        return {"message": 'Card has been deleted.'}

    elif found_card.user_id != usuario.id:
        return {"message": 'Cant delete a card you do not own.'}

    
    session.delete(found_card)
    session.commit()
    
    return {"message": 'card found'}

@cards_route.get(path="/pick_card")
def pick_card(usuario: User = Depends(verify_token), session: Session = Depends(get_session)):

    # Search for cards 
    cards = session.query(CardM).filter_by(user_id=usuario.id).all()

    if not cards:
        return {"message": "No cards were found"}
    
    to_review = [card for card in cards if card.next_review <= datetime.utcnow()]

    if not to_review:
        return {"message": "No cards to review found"}

    sorted_cards = sorted(to_review, key=lambda x: x.next_review)

    print(len(to_review), 'cards to review.')

    return {"message": f"{len(to_review)} cards to review. {sorted_cards[0].front_content}", "card": sorted_cards[0]}

@cards_route.post(path="/update_card")
def update_card(difficulty: Difficulty, card_id: int, usuario: User = Depends(verify_token),session: Session = Depends(get_session)):

    card = session.query(CardM).filter_by(id=card_id).first()

    if not card:
        return {"message": 'card was not found'}
    
    elif card.user_id != usuario.id:
        return {"message": 'Not allowed to do such operation.'}
    
    next_review = get_next_review(difficulty)
    card.review_count += 1
    card.next_review = next_review
    card.difficulty = difficulty.value

    session.commit()

    return {"message": "card was updated."}




    





