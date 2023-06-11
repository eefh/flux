import React from 'react';
import { useState, useEffect } from 'react';
import './settings.css';
import { ArrowLeft, Check } from 'iconoir-react';

const Integrations = (props) => {
    const [ apiKey, setApiKey ] = useState(''); 
    const [submitted, setSubmitted ] = useState('');
    const handleSubmit = () => {
        if (apiKey) {
          setSubmitted(true);
          window.electron.ipcRenderer.send('update-zapier-nla-api-key', apiKey);
        }
      };
      
    return (
        <div className='settings'>
            <div className='top'>
                <div onClick={() => props.setToggleIntegrations(false)} className='back'>
                    <ArrowLeft />
                </div>
                <h2 className='title'>Integrations</h2>
            </div>
            <div className='content'>
                <h4>ChatGPT Plugins</h4>
                <h4>OpenAPI Toolkit</h4>
                <div className='api-wrapper'>
                    <div className='api'><p>Klu Engine</p> <input className='api-input' type='text' placeholder='API key'></input></div>
                    {props.APIs.map((api) => {
                        return <div className='api'>
                            <p>{api.info.title}</p>
                            <input type='text' placeholder='API key'>Hi</input></div>
                    })}
                </div>

                <label for="fileUpload" class="submit">Upload</label>
                <input className='submit' id='fileUpload' type='file'></input>
                <h4>Zapier Natural Language Actions API key <a classname='link' href='https://nla.zapier.com/get-started/' target='_blank'>https://nla.zapier.com/get-started/</a></h4>
                <input className='typeInput' onChange={(e) => setApiKey(e.target.value)} value={apiKey} placeholder='sk-ak...'></input>
                <input type='submit' onClick={handleSubmit} className='submit'></input>
                {submitted && apiKey ? <Check/>: null}
               
            </div>

        </div>
    )
}

export default Integrations;