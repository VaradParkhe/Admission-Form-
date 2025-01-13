import React, { useEffect, useState } from 'react';
import './Record.css';

function Records() {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/records')
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched Data:', data);  // Add this log
                setRecords(data);
            })
            .catch((error) => console.error('Error fetching records:', error));
    }, []);

    return (
        <div className="records-container">
            <h1>All Records</h1>
            {Array.isArray(records) ? (
                records.map((record, index) => (
                    <div key={index} className="record-card">
                        {Object.entries(record).map(([key, value]) => (
                            <div className="record-field" key={key}>
                                <span className="field-name">{key}:</span>
                                <span className="field-value">
                                    {typeof value === 'string' && value.startsWith('/uploads') ? (
                                        <a href={`http://localhost:3000${value}`} target="_blank" rel="noopener noreferrer">
                                            View File
                                        </a>
                                    ) : (
                                        value
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <p>Records are not available</p>  // Handle case when records is not an array
            )}
        </div>
    );
}

export default Records;
