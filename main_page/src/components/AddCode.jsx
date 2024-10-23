import React, { useState } from "react";
import '../App.css';

import SERVER_URL from 'shared_data/react_critical_data.jsx';

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

function timestamp_without_timezone(date) {
    // Extracting components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0'); // Keep full 3 digits

    // Constructing the formatted string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
  
function isOnlyWhiteSpace(s) {
    // Check if the string is composed entirely of whitespace
    var reWhiteSpace = /^\s+$/;

    // Return true if the string consists only of whitespace, false otherwise
    return reWhiteSpace.test(s);
}


function AddCode({ togglePopup }) {
    // Assign variables
    const [title, setTitle] = useState('');
    const [uuid, setUuid] = useState('');
    const [date, setDate] = useState('');
    const [code, setCode] = useState('');
    const [comment, setComment] = useState('');

    const [error, setError] = useState('');

    // Generate uuid if not exist
    if (!uuid) {
        setUuid(uuidv4);
    }

    // Get the timestamp without the timezone
    if (!date) {
        const formattedDate = timestamp_without_timezone(new Date());
        setDate(formattedDate);
    }
    
    function handleTextComment(event) {
        setComment(event.target.value);
    }

    function handleTextCode(event) {
        setCode(event.target.value)
    }

    function handleTitle(event) {
        setTitle(event.target.value);
    }

    function handleSavebutton(){
        if (title === '' || isOnlyWhiteSpace(title)) {
            setError(' ')
            setTimeout(() => {
                setError('Title is required!')
            }, 200)
        }
        else if (code === '' || isOnlyWhiteSpace(code)) {
            setError(' ')
            setTimeout(() => {
                setError('Code is required!')
            }, 200)
        }
        else {
            console.log('transfer to database')
           handleTransferToDb(); 
           togglePopup();
        }
    }

    function handleKeyDownOfCode(event){
        if (event.key === 'Tab') {
          event.preventDefault(); // Prevent the default tab behavior
      
          const textarea = event.target;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const value = textarea.value;
      
          // Insert 8 spaces at the cursor position
          const newValue = value.slice(0, start) + '        ' + value.slice(end);
          textarea.value = newValue;
      
          // Update the state with the new value
          setCode(newValue);
      
          // Move the cursor position to the end of the inserted spaces
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 8;
          }, 0);
        }
    };

    function handleTransferToDb(){
        fetch(`${SERVER_URL}/api/transfer_info_to_db`, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
          body: JSON.stringify({uuid: uuid, code: code, comment: comment, title: title, date: date})
        })
        .then(response => response.json()) // Convert the response to JSON
        .catch(error => {
          console.error('Error transferring data to database:', error);
        });
    }
  
    return(
        <div>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 100 }} onClick={togglePopup}/>
            <div style={{ borderRadius: '50px', position: 'fixed', right: '50%', top: '50%', 
            transform: 'translate(50%, -50%)', zIndex: 101, width: '100%', height: 700, 
            backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.5)', padding: 20, 
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
            <h1>Add Code <span style={{ color: 'red' }}>{error}</span></h1>
            <input value={title} onChange={handleTitle} placeholder="Title" type="text" style={{ border: '0 solid black', fontSize: 20, width: 500}}></input><br/>
            <textarea value={code} onChange={handleTextCode} placeholder="Type your code here..." onKeyDown={handleKeyDownOfCode} style={{background: '#ececec', border: '1px solid #e0e0e0', height: 400, width: '100%', fontSize: 15, color: 'green' }} type="text"></textarea>
            <textarea value={comment} onChange={handleTextComment} placeholder="Comments..." style={{ border: '0px solid #f1f1f1', height: 150, width: '100%', fontFamily: 'Arial', fontSize: 15, color: 'gray', marginTop: 5 }} type="text"></textarea>
            <br/>
            <div>
                <button style={{ cursor: 'pointer', background: 'transparent', color: 'gray', border: 0, height: 40, width: 90, border: 0 }} onClick={togglePopup}>Back</button>
                <button style={{ cursor: 'pointer', background: 'green', color: 'white', borderRadius: 10, height: 40, width: 90, border: 0 }} onClick={handleSavebutton}>Save</button></div>
            </div>
        </div>
    )
}


export default AddCode;
