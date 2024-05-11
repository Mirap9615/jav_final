import React, { useState, useEffect } from 'react';
import FileZone from './FileZone';
import FilePlace from './FilePlace';
import axios from 'axios';
import io from 'socket.io-client';

function App() {
    const [analysisResults, setAnalysisResults] = useState([]);
    const socket = io('http://localhost:1992');

    const onInteractionSuccess = () => {
        console.log("Interaction successful");
        fetchAnalysisResults();
    };

    useEffect(() => {
        socket.on('update', data => {
            console.log(data.message);
            fetchAnalysisResults();
        });

        return () => socket.off('update');
    }, []);

    const fetchAnalysisResults = () => {
        axios.get('/last-analysis')
            .then(response => {
                setAnalysisResults(response.data); 
            })
            .catch(error => {
                console.error('Failed to fetch analysis results:', error);
            });
    };

    return (
        <div>
            <FileZone onInteractionSuccess={onInteractionSuccess} />
            {analysisResults.map((result, index) => (
                <FilePlace key={index} analysisResults={result} fileId={result.fileId} onInteractionSuccess={onInteractionSuccess} /> 
            ))}
        </div>
    );
}

export default App;
