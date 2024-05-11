import React, { useState } from 'react';
import axios from 'axios';

const FilePlace = ({ fileId, analysisResults, onInteractionSuccess }) => {
    const [showAllWords, setShowAllWords] = useState(false);
    const [wordToReplace, setWordToReplace] = useState('');
    const [replacementWord, setReplacementWord] = useState('');

    console.log('Received fileId:', fileId);

    const toggleShowAllWords = () => {
        setShowAllWords(!showAllWords);
    };

    const handleReplaceSubmit = (e, fileId) => {
        e.preventDefault();
        console.log(`Replace ${wordToReplace} with ${replacementWord} for file ID: ${fileId}`);
    
        axios.post('/replace', {
            fileId: fileId,
            originalWord: wordToReplace,
            newWord: replacementWord
        })
        .then(response => {
            onInteractionSuccess();
        })
        .catch(error => {
            console.error('Error during word replacement for file ID ' + fileId + ':', error);
        });
    };    

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* display raw file content */}
            <div style={{ flex: '1 1 50%', padding: '10px', maxWidth: '50%' }}>
                <h2>File Content</h2>
                <div className="file-content-box">
                    <pre>{analysisResults ? analysisResults.fileContents : 'Waiting for file'}</pre>
                </div>
            </div>

            {/* display analysis results */}
            <div style={{ flex: '1 1 45%', padding: '10px', maxWidth: '45%' }}>
            <div className="first_row">
                <h2>Analysis Results</h2>
                <ul>
                    <li>Word Count: {analysisResults ? analysisResults.wordCount : 'N/A'}</li>
                    <li>Letter Count: {analysisResults ? analysisResults.letterCount : 'N/A'}</li>
                    <li>Symbol Count: {analysisResults ? analysisResults.symbolCount : 'N/A'}</li>
                    <li>Total Count: {analysisResults ? analysisResults.totalCount : 'N/A'}</li>
                </ul>
                <h2>Replace Words</h2>
                <form onSubmit={(e) => handleReplaceSubmit(e, fileId)}>
                    <label>
                        Replace
                        <br></br>
                        <input
                            type="text"
                            value={wordToReplace}
                            onChange={e => setWordToReplace(e.target.value)}
                            placeholder="Word to replace"
                            required
                        />
                    </label>
                    <br></br>
                    <span> with </span>
                    <br></br>
                    <label>
                        <input
                            type="text"
                            value={replacementWord}
                            onChange={e => setReplacementWord(e.target.value)}
                            placeholder="Replacement"
                            required
                        />
                    </label>
                    <div>
                        <button type="submit" style={{ marginTop: '10px' }}>Replace</button>
                    </div>
                    </form>
            </div>
            
            <h2>Word Frequency</h2>
            {analysisResults && analysisResults.wordFrequency && Object.keys(analysisResults.wordFrequency).length > 0 ? (
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Word</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(analysisResults.wordFrequency).slice(0, showAllWords ? undefined : 10).map(([word, count]) => (
                                <tr key={word}>
                                    <td>{word}</td>
                                    <td>{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={toggleShowAllWords} style={{ marginTop: '10px' }}>
                        {showAllWords ? 'Show Less' : 'Show More'}
                    </button>
                </div>
                ) : (
                    <p>N/A</p>
                )}
            </div>
        </div>
    );
};

export default FilePlace;
