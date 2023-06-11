import React from 'react';
import { useState, useEffect } from 'react';
import './history.css';
import { Plus, Cancel } from 'iconoir-react';

const History = React.forwardRef((props, ref) => {

    const handleNewChat = () => {
        if (props.messages.length) {
          // Check if the current chat is already in the history
          const isCurrentChatInHistory = props.history.some(
            (chat) => JSON.stringify(chat) === JSON.stringify(props.messages)
          );
      
          // If the current chat is not in the history, add it
          if (!isCurrentChatInHistory) {
            props.setLoading(false);
            props.setHistory([props.messages, ...props.history]);
          }
      
          // Clear the current messages
          props.setMessages([]);
        }
      };
      
      const handleChatLoad = (i) => {
        const isCurrentChatSelected =
          JSON.stringify(props.messages) === JSON.stringify(props.history[i]);
      
        if (!isCurrentChatSelected) {
          // If the selected chat is not the same, store current messages if not present in history
          const isCurrentChatInHistory = props.history.some(
            (chat) => JSON.stringify(chat) === JSON.stringify(props.messages)
          );
      
          if (props.messages.length && !isCurrentChatInHistory) {
            props.setHistory((prevHistory) => [props.messages, ...prevHistory]);
          }
      
          // Set the new messages using the previously saved data in the history
          props.setMessages(props.history[i]);
        }
      };
      
  // Function to delete a chat from history
  const handleDeleteChat = (i, event) => {
    event.stopPropagation(); // Prevent ChatLoad from being triggered
    props.setHistory(
      prevHistory => prevHistory.filter((chat, index) => index !== i)
    );
  };

  return (
    <div className='history' ref={ref}>
      <div className='newchat' onClick={handleNewChat}>
        <Plus />
      </div>
      {props.history
        ? props.history.map((chat, i) => {
            return (
              <div
                className='historyChat'
                onClick={() => handleChatLoad(i)}
                key={i}
              >
                <strong>{chat[0].content}</strong>
                <Cancel
                  className='cancel'
                  onClick={(event) => handleDeleteChat(i, event)}
                />
              </div>
            );
          })
        : null}
    </div>
  );
});

export default History;