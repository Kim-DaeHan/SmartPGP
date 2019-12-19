import React from 'react'

import './MailBox.scss';

const MailBox = ({ title, msgs, onClickName =(() => {  }), onClickContent =(() => {  }) }) => {
  return (
    <div className='mail-box'>
      <h3 className='mail-title'>{title}</h3>
      <ul className='mail-list'>
        {msgs.map((v, i) =>
          <li key={title + i}><b onClick={() => onClickName(v)}>{v.user[0].name}</b> 
          : <span onClick={() => onClickContent(v)}>{v.content}</span></li>
        )}
      </ul>
    </div>
  )
}

export default MailBox
