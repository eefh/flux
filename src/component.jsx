import React from 'react';
import { useState, useEffect, useRef } from 'react';
import './index.css';

import History from './history.jsx';
import Settings from './settings.jsx';
import Integrations from './integrations.jsx';
import DbMenu from './database.jsx';
import { SendDiagonal, MoreHoriz, BookmarkBook, Wind, Db, GridAdd, Code, Right } from 'iconoir-react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { CodeBlock, monoBlue, monokaiSublime } from 'react-code-blocks';
const MyComponent = () => {
    const historyRef = useRef(); 
    const dbRef = useRef();
    const [ userInput, setUserInput ] = useState('');
    const [ messages, setMessages ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ toggleOption, setToggleOption ] = useState(false);
    const [ toggleHistory, setToggleHistory ] = useState(false);
    const [ toggleIntegrations, setToggleIntegrations ] = useState(false);
    const [ toggleDb , setToggleDb] = useState(false);
    const [ chatTitle, setChatTitle ] = useState('');
    const [ history, setHistory ] = useState([]);


    const handleDocumentClick = (e) => {
      if (toggleHistory && historyRef.current && !historyRef.current.contains(e.target)) {
        // If click is outside the History component, set toggleHistory to false
        setToggleHistory(false);
      } else if (toggleDb && dbRef.current && !dbRef.current.contains(e.target)){
        setToggleDb(false);
      }
    };

const handleFileUpload = (fileContent) => {
  console.log("Hello!");
  if (window.electron?.ipcRenderer) {
    window.electron.ipcRenderer.send("uploadFile", fileContent);
  }
};


    const handleClick = (content) => {
      setLoading(true);
      if (userInput && window.electron?.ipcRenderer) {
        setMessages([...messages, { role: 'user', content: userInput }]);
        setUserInput("");
        window.electron.ipcRenderer.send('my-channel', [userInput, messages, history]);
        console.log("HISTORY: ", history);
      } else if (content) {
        setMessages([...messages, { role: 'user', content: content }]);
        setUserInput("");
        window.electron.ipcRenderer.send('my-channel', [content, messages, history]);
      }
    };

    useEffect(() => {
      const handleSavedConversation = (savedConversation) => {
        console.log("Received saved conversation:", savedConversation);
        setHistory(savedConversation);
      };
      
      const handleMainWindowReady = () => {
        // Send a request to the main process to get the saved conversation
        window.electron.ipcRenderer.send('request-saved-conversation');
      };
  
      // Add listeners for 'saved-conversation' and 'main-window-ready' events
      window.electron.ipcRenderer.on('saved-conversation', handleSavedConversation);
      window.electron.ipcRenderer.on('main-window-ready', handleMainWindowReady);
  
      // Clean up the listeners when the component unmounts
      return () => {
        window.electron.ipcRenderer.removeListener('saved-conversation', handleSavedConversation);
        window.electron.ipcRenderer.removeListener('main-window-ready', handleMainWindowReady);
      };
    }, []);
  

    useEffect(() => {
      document.addEventListener('click', handleDocumentClick);
  
      // Clean up the event listener when the component unmounts
      return () => {
        document.removeEventListener('click', handleDocumentClick);
      };
    }, [toggleHistory]);
    useEffect(() => {
      document.addEventListener('click', handleDocumentClick);
  
      // Clean up the event listener when the component unmounts
      return () => {
        document.removeEventListener('click', handleDocumentClick);
      };
    }, [toggleDb]);
    useEffect(() => {
      // Listener for agent actions
      const handleAgentAction = (action) => {
        console.log("Received agent action:", action);
        setMessages((prevMessages) => [
          ...prevMessages,
          {role: 'action', title: action.tool, content: action.toolInput, log: action.log}
        ]);
        // Process the action data here
      };
  
      // Listener for 'my-channel' responses
      const handleMessageResponse = (data) => {
        console.log('Received data from the main process:', data);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: data },
        ]);
        setLoading(false);
      };
  
      // Add listeners
      window.electron.ipcRenderer.on('agentAction', handleAgentAction);
      window.electron.ipcRenderer.on('my-channel', handleMessageResponse);

      // Clean up the listeners when the component unmounts
      return () => {
        window.electron.ipcRenderer.removeListener('agentAction', handleAgentAction);
        window.electron.ipcRenderer.removeListener('my-channel', handleMessageResponse);
      };
    }, []);

    /*useEffect(() => {
      try {
        if (!window.electron?.ipcRenderer) return;
        const listener = (data) => {
          console.log('Received data from the main process:', data);
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: 'assistant', content: data },
          ]);
          setLoading(false);
        };
  
        window.electron.ipcRenderer.on('my-channel', listener);
        
      } catch (error) {
        console.log(error);
        setLoading(false);
      }

      // Clean up the listener on unmount
      return () => {
        window.electron.ipcRenderer.removeAllListeners('my-channel');
      };
    }, []);*/
    const keyDown = (event) => {
      if (event.key === 'Enter' && userInput) {
        // Submit the message
        setLoading(true);
        handleClick();
        // Clear the input field
        setUserInput('');
      }
    }
    const handleItemClick = (content) => {
      console.log(content.trim());
      handleClick(`Let's go with "${content.trim()}"`);
      setUserInput('');
    }
    // Update the store whenever the state changes
    function processAssistantMessageContent(content, handleItemClick) {
      const regex = /~~~(\w+)\s+([\s\S]*?)~~~/g;
      let match;
      let lastIndex = 0;
      const elements = [];
    
      while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          const textBeforeCode = content.slice(lastIndex, match.index);
          elements.push(...processNumberedList(textBeforeCode, handleItemClick));
        }
        lastIndex = regex.lastIndex;
    
        const language = match[1];
        const code = match[2];
    
        elements.push(
          <CodeBlock
            text={code.trim()}
            customStyle={{fontSize: '13px', fontFamily: 'monospace'}}
            theme={monoBlue}
            language={language}
            showLineNumbers={false}
          />
        );
      }
    
      if (lastIndex < content.length) {
        elements.push(...processNumberedList(content.slice(lastIndex), handleItemClick));
      }
    
      return elements;
    }
    
    function processNumberedList(content, handleItemClick) {
      if (!content.match(/\d+\./)) {
        return [<span >{content}</span>];
      }
      const [beforeEndList, afterEndList] = content.split('ENDLIST');
      const splitInstructions = beforeEndList.split(/(\d+\.)/);
    
      const numberedElements = splitInstructions.reduce((acc, part, index) => {
        if (/^\d+\.$/.test(part)) {
          acc.push(<strong key={index} className="listNumber">{part}</strong>);
        } else {
          acc[acc.length - 1] = (
            <div key={index} className="listItem" onClick={() => handleItemClick(part)}>
              {acc[acc.length - 1]}
              <span>{part.trim()}</span>
            </div>
          );
        }
        return acc;
      }, []);
    
      const afterEndListElement = afterEndList.trim() ? <span>{afterEndList.trim()}</span> : [];
      return numberedElements.concat(afterEndListElement);
    }
    
    
    
  return (
    <div className='app'>
        <div className='navbar-container'>
            <p className='option' onClick={() => setToggleHistory(true)}><BookmarkBook/></p>
            <p className='option' onClick={() => setToggleDb(true)}><Db/></p>
            <p className='option' onClick={() => setToggleIntegrations(true)}><GridAdd/></p>
            <p className='option' onClick={() => setToggleOption(true)}><MoreHoriz/></p>
        </div>
      <div className='chat-container'>
        {messages.length ? null : <div className='empty'><p>This chat is empty</p></div>}
      <div className="chat-messages-wrapper">
        <div className='chat-messages'>
        {messages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <div className="message" key={i}>
              <p>{msg.content}</p>
            </div>
          );
        } else if (msg.role === 'assistant') {
          return (
            <div className="ai" key={i}>
              <p>
                {processAssistantMessageContent(msg.content, handleItemClick)}
              </p>
            </div>
          );
        } else {
          return (
            <div className="action" key={i}>
              <p>
                <strong>Action: {msg.title}</strong>
              </p>
              <p>
                <em>{msg.content}</em>
              </p>
              <CodeBlock
                text={msg.log ? msg.log.replace(/^```json\s+|\s+```$/g, '') : ""}
                theme={monoBlue}
                language="json"
                showLineNumbers={false}
              />
            </div>
          );
        }
      })}
            {//<div className='action'>🤖 <strong>Thinking:</strong> <em>I need more context to guide you in answering this question. What specifically are you attempting to style? Classes? A webpage? Network requests?</em></div>
            }{loading ? <div className='loading'></div> : null}
        </div>
        </div>
      </div>
      <div className='input-container'>
        <div className='input-wrapper'>
            <input onKeyDown={keyDown} placeholder='Ask me anything...' className='user-input' onChange={(e) => setUserInput(e.target.value)} value={userInput}></input>
            {userInput ? <button className='button' onClick={handleClick}><SendDiagonal /></button> : <button className='buttonGrey'><SendDiagonal /></button>}
        </div>
      </div>
      {toggleOption ? <Settings setToggleOption={setToggleOption}/> : null}
      {toggleHistory ? <History ref={historyRef} history={history} setLoading={setLoading} setMessages={setMessages} messages={messages} setHistory={setHistory}/> : null}
      {toggleIntegrations ? <Integrations setToggleIntegrations={setToggleIntegrations}/> : null}
      {toggleDb ? <DbMenu ref={dbRef} handleFileUpload={handleFileUpload} /> : null}
    </div>
  );
};

export default MyComponent;