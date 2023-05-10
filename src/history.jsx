import React from 'react';
import { useState, useEffect } from 'react';
import './history.css';
import { Plus } from 'iconoir-react';
const History = React.forwardRef((props, ref) => {

    const handleNewChat = () => {
        if (props.messages.length) {
            props.setLoading(false);
            props.setHistory([props.messages, ...props.history]);
            props.setMessages([]);
            console.log(props.history);
        }
    }
    const handleChatLoad = (i) => {
        if (props.messages.length) {
            props.setLoading(false);
            props.setHistory([props.messages, ...props.history]);

            props.setMessages([props.history[i]]);
        } else {
            console.log("Index: ", i);
            console.log(props.history)
            console.log([props.history[i]]);
            props.setMessages(props.history[i]);
        }
    }
    return (
        <div className='history' ref={ref}>
            <div className='newchat' onClick={handleNewChat}>
                <Plus/>
            </div>
            {props.history ? props.history.map((chat, i) => {
                return <div className='historyChat' onClick={() => handleChatLoad(i)} key={i}><strong>{chat[0].content}</strong></div>
            }) : null}
        </div>
    )
});

export default History