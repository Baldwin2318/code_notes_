import { useState, useEffect } from "react";

function SideBar({ clickAddCode, data, setSelectedCode }) {
    const [codeList, setCodeList] = useState([]);
    // Update codeList when data changes
    useEffect(() => {
        if (data) {
            setCodeList(Object.keys(data));
        }
    }, [data]);

    function handleSelectedCode(s){
        setSelectedCode([]); //clear 
        setTimeout(() => {
            setSelectedCode(s);  
        }, 1);
    }

    // Code List
    function renderCodeList(){
        return codeList.map((item, id) => (
            <div key={id}>
                <button onClick={() => handleSelectedCode(data[item][0])} style={{ cursor: 'pointer', textAlign: 'left', width: 250, height: 25, color: 'darkblue' }}>{item} </button>
            </div>
        ));
    };

    return(
        <div style={{ borderRadius: 20, background: 'gray', padding: 10, border: '0px solid #9e9e9e', width: 260, height: 700, overflow: "auto", direction: 'rtl' }}>
            <button style={{ cursor: 'pointer', fontSize: 30, borderRadius: 10, width: 250, height: 50, background: '#5e5e5e', color: 'white', border: '1px solid #9e9e9e' }} onClick={clickAddCode}>+</button>
            <br/> <br/>
            {data && renderCodeList()}
        </div>
    )

}

export default SideBar;