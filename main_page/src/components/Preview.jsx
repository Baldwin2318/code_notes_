import { useEffect, useState } from "react";
import ConfirmationAlert from "../components/ConfirmationAlert.jsx"
import React from "react";

import SERVER_URL from 'shared_data/react_critical_data.jsx';

function Preview({ selectedCode, setSelectedCode }) {
    const [data, setData] = useState([]);
    const [copiedAlert, setCopiedAlert] = useState('');
    const [popUpVisible, setPopUpVisible] = useState(false);
    
    function handlePopupVisible() {
      setPopUpVisible(!popUpVisible);
    }

   function handleCopyCode(){
      navigator.clipboard.writeText(`${data.code}`); 
      setCopiedAlert('copied to clipboard!');
      setTimeout(() => {
        setCopiedAlert('');
      }, 300);
   }
   
   const [removeSuccess, setRemoveSuccess] = useState(false)
   function handleRemoveCode(){
    fetch(`${SERVER_URL}/api/remove_item_from_db/${data.id}/${data.uuid}`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
      })
      .then(response => response.json()) // Convert the response to JSON
      .then(data => {
        setData(data);
        setRemoveSuccess(true);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

      if (removeSuccess) setSelectedCode('');
   }

    useEffect(() => {
        if (selectedCode.length <= 0) return;
        fetch(`${SERVER_URL}/api/get_info_of_selectedCode_from_db/${selectedCode.id}/${selectedCode.uuid}`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
        })
        .then(response => response.json()) // Convert the response to JSON
        .then(data => {
          setData(data)
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }, [selectedCode]);

    return(
        <div style={{  background: 'transparent', padding: 10, border: 0, marginLeft: 5, width: '100%', height: 750 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ color: 'darkblue' }}>{data.title}</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <button onClick={() =>  { handleCopyCode() }} style={{ cursor: 'pointer', margin: 5, background: 'transparent', border: '1px solid darkblue', color: 'darkblue', height: 20, width: 100, borderRadius: 5 }}>Copy code</button>
                <label style={{ margin: 5, fontSize: 15, color: 'lightgray' }}>{copiedAlert}</label>
              </div>
              <button onClick={() => handlePopupVisible()} style={{ cursor: 'pointer', background: 'red', border: 0, color: 'white', height: 20, width: 70, borderRadius: 5 }}>Remove</button>
           </div>
            <textarea value={data.code} style={{ height: 500, width: '100%', fontSize: 15, border: 0, background: '#e0e0e0' }}></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <label style={{ color: 'darkblue' }}>{data.date_time_infosaved}</label></div>
            <textarea value={data.comment} style={{ height: '80%', width: '100%', fontSize: 15, border: 0, color: 'lightgray', background: 'transparent' }}></textarea>
           

          { popUpVisible && <ConfirmationAlert togglePopup={handlePopupVisible} handleFunction={handleRemoveCode} msg={`Are you sure you want to permanently remove`} selectedItem={data.title} yesColor={'red'}/>}
        </div>
    )

}

export default Preview;