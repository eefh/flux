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
    }
    return (
        <div className='settings'>
            <div className='top'>
                <div onClick={() => props.setToggleIntegrations(false)} className='back'>
                    <ArrowLeft />
                </div>
                <h2 className='title'>Integrations</h2>
            </div>
            <div className='content'>
                <h4>Upload OpenAPI .yaml file</h4>
                <label for="fileUpload" class="submit">Upload</label>
                <input className='submit' id='fileUpload' type='file'></input>
                <h4>Zapier Natural Language Actions API key <a classname='link' href='https://nla.zapier.com/get-started/' target='_blank'>https://nla.zapier.com/get-started/</a></h4>
                <input className='typeInput' onChange={(e) => setApiKey(e.target.value)} value={apiKey} placeholder='sk-ak...'></input>
                <input type='submit' onClick={handleSubmit} className='submit'></input>
                {submitted && apiKey ? <Check/>: null}
                <h4>AutoGPT</h4>
            </div>

        </div>
    )
}

export default Integrations;