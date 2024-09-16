import React from "react";  

function ConfirmationAlert({ togglePopup, handleFunction, msg, selectedItem, yesColor }) {
    // This component is usable
    
    return(
        <div>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 100 }} onClick={togglePopup}/>

            <div style={{ borderRadius: '50px', position: 'fixed', right: '50%', top: '50%', 
                transform: 'translate(50%, -50%)', zIndex: 101, width: 500, height: 200, 
                backgroundColor: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.5)', padding: 20, 
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
                 <label>{msg} <span style={{ fontWeight: 'bold' }}>{selectedItem}</span>?</label>
                <div style={{ display: 'flex', justifyItems: 'right', justifyContent: 'right', paddingTop: 80 }}>
                    <button style={{ color: '#1e1e1e', height: 40, width: 100, border: '0px solid white', background: 'transparent' }} onClick={togglePopup}>No</button>    
                    <button style={{ color: 'white', height: 35, width: 100, border: '1px solid red', background: `${yesColor}`, borderRadius: 10 }} onClick={() => {handleFunction(); togglePopup();}}>Yes</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationAlert;