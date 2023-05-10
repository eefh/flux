import React from 'react';
import { useState, useEffect } from 'react';
import './settings.css';
import { ArrowLeft } from 'iconoir-react';

const Settings = (props) => {
    return (
        <div className='settings'>
            <div className='top'>
                <div onClick={() => props.setToggleOption(false)} className='back'>
                    <ArrowLeft />
                </div>
                
                <h2 className='title'>Settings</h2>
            </div>
            <div className='content'>
                <h4>Hotkeys</h4>
                <div className='block'>
                    <p className='select'>Cmd + Shift + F</p>
                </div>

            </div>

        </div>
    )
}

export default Settings;