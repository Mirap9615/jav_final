import React, { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import './FileZone.css'

function FileDrop({ onInteractionSuccess }) {
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);  

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        setDragOver(true);
    }, []);

    const onDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        setDragOver(false);
        const files = event.dataTransfer.files;
        handleFiles(files);
    }, []);

    const onFileInputChange = (event) => {
        const files = event.target.files;
        handleFiles(files);
    };

    const handleFiles = (files) => {
        uploadFiles(files);
    };

    const handleClick = () => {
        fileInputRef.current.click();  
    };

    const uploadFiles = (files) => {
        const url = '/upload';
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            console.log('File uploaded successfully');
            if (onInteractionSuccess) {
                onInteractionSuccess();
            }
        })
        .catch(error => {
            console.error('Error uploading file', error);
        });
    };

    return (
        <div
            className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onClick={handleClick} 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {dragOver ? "Drop here!" : "Drag files here or click to upload"}
            <input
                ref={fileInputRef}
                type="file"
                onChange={onFileInputChange}
                style={{ display: 'none' }} 
                multiple  
            />
        </div>
    );
}

export default FileDrop;
