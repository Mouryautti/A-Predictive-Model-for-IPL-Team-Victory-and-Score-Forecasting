from fastapi import FastAPI
from pydantic import BaseModel
import pickle
import numpy as np
import tensorflow as tf
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IPL(BaseModel):
    venue: str
    batting_team: str
    bowling_team: str
    striker: str
    bowler: str

class WinData(BaseModel):
    batting_team: str
    bowling_team: str
    city: str
    runs_left: int
    balls_left: int
    wickets: int
    total_runs_x: int
    crr: float
    rrr: float

model = tf.keras.models.load_model('scoreForecasting.h5')
with open("scoreFencoder.pickle", "rb") as f:
    combinedEncoders = pickle.load(f)
with open("sFscalarFile.pickle", "rb") as f1:
    scaler = pickle.load(f1)
with open("IPL_win_classify.pickle", "rb") as f:
    winClassify = pickle.load(f)

def pipe(venue, batting_team, bowling_team, striker, bowler):
    decoded_venue = combinedEncoders["venue_encoder"].transform([venue])
    decoded_batting_team = combinedEncoders["batting_team_encoder"].transform([batting_team])
    decoded_bowling_team = combinedEncoders["bowling_team_encoder"].transform([bowling_team])
    decoded_striker = combinedEncoders["striker_encoder"].transform([striker])
    decoded_bowler = combinedEncoders["bowler_encoder"].transform([bowler])
    inp = np.array([decoded_venue, decoded_batting_team, decoded_bowling_team, decoded_striker, decoded_bowler])
    inp = scaler.transform(inp.reshape(1, 5))
    return int(model.predict(inp)[0, 0])

def winProb(ndata):
    data = {
        'batting_team': [ndata.batting_team],
        'bowling_team': [ndata.bowling_team],
        'city': [ndata.city],
        'runs_left': [ndata.runs_left],
        'balls_left': [ndata.balls_left],
        'wickets': [ndata.wickets],
        'total_runs_x': [ndata.total_runs_x],
        'crr': [ndata.crr],
        'rrr': [ndata.rrr]
    }

    df = pd.DataFrame(data)
    return winClassify.predict_proba(df)[0]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/predictIplScore")
def create_item(item: IPL):
    try:
        print("Hello Mourya")
        print(item)
        score = pipe(item.venue, item.batting_team, item.bowling_team, item.striker, item.bowler)
        return {"score": score}
    except Exception as e:
        return {"error": str(e)}

@app.post("/winProb")
def check_item(win: WinData):
    try:
        pred = winProb(win)
        return {"batsman": pred[0], "bowler": pred[1]}
    except Exception as e:
        return {"error": str(e)}
