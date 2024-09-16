import React, { useEffect, useState } from 'react';
import SideBar from './components/SideBar';
import Preview from './components/Preview';
import AddCode from './components/AddCode';
import SERVER_URL from 'shared_data/react_critical_data.jsx';

function App() {
  const title = '<CodeNotes />';
  const [data, setData] = useState([])
  const [selectedCode, setSelectedCode] = useState([]);

  // Assign toggle popup
  const [addCodeWindow, setAddCodeWindow] = useState(false);
  function HandleAddCodeWindow () {
      setAddCodeWindow(prev => !prev);
  }

  useEffect(() => {
    fetch(`${SERVER_URL}/api/get_info_from_db`, {
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
  }, [HandleAddCodeWindow]);
  
  return (
    <div>
      <h1 style={{ color: '#4e4e4e', paddingLeft: 70, fontFamily: 'Fira Code' }}>{title}</h1>
      <div style={{ justifyContent: 'flex-start', display: 'flex', paddingLeft: 20 }}>
        <SideBar clickAddCode={HandleAddCodeWindow} data={data} setSelectedCode={setSelectedCode}/>
        {!(selectedCode.length === 0) && <Preview selectedCode={selectedCode} setSelectedCode={setSelectedCode}/>}
        {(selectedCode.length === 0) && <h1 style={{ padding: 100, fontStyle: 'italic', color: '#b1b1b1' }}>Select an item on the left side list</h1>}
      </div>
      {addCodeWindow && <AddCode togglePopup={HandleAddCodeWindow}/>}
    </div>
  );
}

export default App;