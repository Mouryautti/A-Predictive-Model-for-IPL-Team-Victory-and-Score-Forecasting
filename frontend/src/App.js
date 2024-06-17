import React, { useState } from 'react';
import './App.css';

const App = () => {
    const batTeam = ['Sunrisers Hyderabad', 'Kolkata Knight Riders', 'Mumbai Indians', 'Chennai Super Kings'];
    const bowTeam = ['Kings XI Punjab', 'Royal Challengers Bangalore', 'Delhi Capitals', 'Rajasthan Royals'];
    const stad = ["M Chinnaswamy Stadium", "Eden Gardens", "Wankhede Stadium", "Chepauk Stadium"];
    const city = ['Bangalore', 'Kolkata', 'Mumbai', 'Chennai', 'Johannesburg'];
    const striker = ["SC Ganguly", "V Kohli", "R Sharma", "MS Dhoni"];
    const bowler = ["P Kumar", "J Bumrah", "M Shami", "R Ashwin"];

    const [formData, setFormData] = useState({
        stadium: '',
        battingTeam: '',
        bowlingTeam: '',
        player1: '',
        player2: '',
        city: '',
        runsLeft: '',
        ballsLeft: '',
        wickets: '',
        totalRunsX: '',
        crr: '',
        rrr: ''
    });

    const [score, setScore] = useState(null);
    const [probabilities, setProbabilities] = useState({ batsman: null, bowler: null });

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log("Changing ${name} to ${value}");
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        console.log("Form Data before submission:", formData);

        try {
            console.log()
            const response1 = await fetch('http://127.0.0.1:8000/predictIplScore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    venue: formData.stadium,
                    batting_team: formData.battingTeam,
                    bowling_team: formData.bowlingTeam,
                    striker: formData.player1,
                    bowler: formData.player2
                })
            });

            const data1 = await response1.json();
            setScore(data1.score);

            const response2 = await fetch('http://127.0.0.1:8000/winProb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    batting_team: formData.battingTeam,
                    bowling_team: formData.bowlingTeam,
                    city: formData.city,
                    runs_left: formData.runsLeft,
                    balls_left: formData.ballsLeft,
                    wickets: formData.wickets,
                    total_runs_x: formData.totalRunsX,
                    crr: formData.crr,
                    rrr: formData.rrr
                })
            });

            const data2 = await response2.json();
            setProbabilities({ batsman: data2.batsman, bowler: data2.bowler });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="container">
            <label htmlFor="stadium">Stadium:</label>
            <select id="stadium" name="stadium" onChange={handleChange}>
                {stad.map((stadium, index) => (
                    <option key={index} value={stadium}>{stadium}</option>
                ))}
            </select>

            <label htmlFor="battingTeam">Batting Team:</label>
            <select id="battingTeam" name="battingTeam" onChange={handleChange}>
                {batTeam.map((team, index) => (
                    <option key={index} value={team}>{team}</option>
                ))}
            </select>

            <label htmlFor="bowlingTeam">Bowling Team:</label>
            <select id="bowlingTeam" name="bowlingTeam" onChange={handleChange}>
                {bowTeam.map((team, index) => (
                    <option key={index} value={team}>{team}</option>
                ))}
            </select>

            <label htmlFor="player1">Player 1 (Striker):</label>
            <select id="player1" name="player1" onChange={handleChange}>
                {striker.map((player, index) => (
                    <option key={index} value={player}>{player}</option>
                ))}
            </select>

            <label htmlFor="player2">Player 2 (Bowler):</label>
            <select id="player2" name="player2" onChange={handleChange}>
                {bowler.map((player, index) => (
                    <option key={index} value={player}>{player}</option>
                ))}
            </select>

            <label htmlFor="city">City:</label>
            <select id="city" name="city" onChange={handleChange}>
                {city.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                ))}
            </select>

            <label htmlFor="runsLeft">Runs Left:</label>
            <input type="number" id="runsLeft" name="runsLeft" onChange={handleChange} />

            <label htmlFor="ballsLeft">Balls Left:</label>
            <input type="number" id="ballsLeft" name="ballsLeft" onChange={handleChange} />

            <label htmlFor="wickets">Wickets:</label>
            <input type="number" id="wickets" name="wickets" onChange={handleChange} />

            <label htmlFor="totalRunsX">Total Runs X:</label>
            <input type="number" id="totalRunsX" name="totalRunsX" onChange={handleChange} />

            <label htmlFor="crr">Current Run Rate (CRR):</label>
            <input type="number" id="crr" name="crr" step="0.01" onChange={handleChange} />

            <label htmlFor="rrr">Required Run Rate (RRR):</label>
            <input type="number" id="rrr" name="rrr" step="0.01" onChange={handleChange} />

            <button onClick={handleSubmit}>Submit</button>

            {score !== null && <div>Predicted Score: {score}</div>}
            {probabilities.batsman !== null && probabilities.bowler !== null && (
                <div>
                    <div>Batsman's Probability of Winning: {probabilities.batsman}%</div>
                    <div>Bowler's Probability of Winning: {probabilities.bowler}%</div>
                </div>
            )}
        </div>
    );
};

export default App;
