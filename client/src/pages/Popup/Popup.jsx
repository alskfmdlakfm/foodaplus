import React from 'react';
import './Popup.css';

const Popup = () => {
  return (
    <div className="popup">
      <header className="popup-header">
        <p>
          Navigate to Fooda to start using Fooda+
        </p>
        <a
          className="app-link"
          href="https://app.fooda.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Take me there!
        </a>
      </header>
    </div>
  );
};

export default Popup;
