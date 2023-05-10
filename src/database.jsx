import React from 'react';
import { useState, useEffect } from 'react';
import './database.css';
import { Upload } from 'iconoir-react';
const DBMenu = React.forwardRef((props, ref) => {
    const [ hover, setHover ] = useState(false);
    
    const handleDragOver = (e) => {
        e.preventDefault();
        setHover(true);
      };
    
      const handleDrop = async (e) => {
        e.preventDefault();
        console.log("handleDrop");
    
        // Check if the event has files
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            console.log("File");
            console.log(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = e.target.result;
                props.handleFileUpload(fileContent); // Pass the file content to the parent component
            };
            reader.readAsText(file);
        } else {
            console.log("No files found in event");
        }
    };
    
    return (
        <div className='db-wrapper'>
            <div className={hover ? `database hover` : `database`} ref={ref} onDragOver={handleDragOver}
            onDrop={handleDrop} onDragLeave={() => setHover(false)}>
                <h4>Drag and drop a compatible file type</h4>
                <div className='upload'><Upload/></div>
                
            </div>

        </div>
    )
});

export default DBMenu;