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
    const [thoughtLoading, setThoughtLoading] = useState(false);
    const [ APIs, setAPIs ] = useState([]); 
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
  setThoughtLoading(true);
  if (userInput && window.electron?.ipcRenderer) {
    setMessages([
      ...messages, 
      { role: 'user', content: userInput }, 
      { role: 'ai', content: "", thought: "", actionTitle: "", actionContent: "", actionLog: "" }
    ]);
    setUserInput("");
    sendThought(userInput);
    window.electron.ipcRenderer.send('my-channel', [userInput, messages, history]);
    console.log("HISTORY: ", history);
  } else if (content) {
    setMessages([
      ...messages, 
      { role: 'user', content: content }, 
      { role: 'ai', content: "", thought: "", actionTitle: "", actionContent: "", actionLog: "" }
    ]);
    setUserInput("");
    sendThought(content);
    window.electron.ipcRenderer.send('my-channel', [content, messages, history]);
  }
};

const updateAIMessage = (newContent) => {
  setMessages((prevMessages) => {
    // Find the index of the last AI message
    let index = prevMessages.length - 1;
    while (index >= 0 && prevMessages[index].role !== 'ai') {
      index--;
    }

    // If an AI message found, update it and return the new array
    if (index >= 0) {
      const updatedMessage = { ...prevMessages[index], ...newContent };
      return [
        ...prevMessages.slice(0, index),
        updatedMessage,
        ...prevMessages.slice(index + 1),
      ];
    }

    // If no AI message, return the previous messages unchanged
    return prevMessages;
  });
};

useEffect(() => {
  // Listener for thoughts
  const handleThoughtResponse = (thought) => {
    console.log("Received thought from the main process:", thought);
    updateAIMessage({thought});
    setThoughtLoading(false);
  };
  
  // Add listener for 'thought-response'
  window.electron.ipcRenderer.on('thought-response', handleThoughtResponse);

  // Clean up the listeners when the component unmounts
  return () => {
    window.electron.ipcRenderer.removeListener('thought-response', handleThoughtResponse);
  };
}, []);


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
        updateAIMessage({
          actionTitle: action.tool,
          actionContent: action.toolInput,
          actionLog: action.log,
        });
      };
  
      // Listener for 'my-channel' responses
      const handleMessageResponse = (data) => {
        console.log('Received data from the main process:', data);
        updateAIMessage({content: data});
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

    const sendThought = (input) => {
      if (input && window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.send('get-thought', input);
      }
    };
    
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
      if (!content.match(/^\d+\. $|^ENDLIST$/m)) {
        return [<span>{content}</span>];
      }
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
  } else {
    return (
      <>{msg.thought || msg.content ? <div className="ai" key={i}>
        {msg.thought.length && <em className='thought'>{msg.thought}</em>}
        {msg.actionTitle && (
          <div className='action'>
            <p>
              <strong>Action: {msg.actionTitle}</strong>
            </p>
            <p>
              <em>{msg.actionContent}</em>
            </p>
            <CodeBlock
              text={msg.actionLog ? msg.actionLog.replace(/^```json\s+|\s+```$/g, '') : ''}
              theme={monoBlue}
              language="json"
              showLineNumbers={false}
            />
          </div>
        )}

        {msg.content &&
          <p className='aimessage'>{processAssistantMessageContent(msg.content, handleItemClick)}</p>}
      </div> : null}
          
      </>
    );
  }
})}
            
            {loading && thoughtLoading ? <p className='typing'>Reading...</p> : loading && !thoughtLoading ? <p className='typing'>Typing...</p> : null}
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
      {toggleIntegrations ? <Integrations setToggleIntegrations={setToggleIntegrations} APIs={APIs} setAPIs={setAPIs}/> : null}
      {toggleDb ? <DbMenu ref={dbRef} handleFileUpload={handleFileUpload} /> : null}
    </div>
  );
};

export default MyComponent;