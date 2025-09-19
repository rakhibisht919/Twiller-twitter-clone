import React from "react";
import './ComposeModal.css';

const ComposeModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="compose-modal-overlay" onClick={onClose}>
      <div className="compose-modal-back">
        {/* Place the encircled elements here as background */}
        <div style={{padding: "24px"}}>
          <div style={{fontWeight: "bold", fontSize: "1.5rem"}}>Home</div>
          <div style={{display: "flex", alignItems: "center", marginTop: "24px"}}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#6c7a89",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              marginRight: "12px"
            }}>R</div>
            <span style={{fontSize: "1.1rem"}}>What's happening?</span>
          </div>
          <div style={{display: "flex", gap: "10px", marginTop: "18px"}}>
            <span>📷</span>
            <span>📊</span>
            <span>😊</span>
          </div>
          <button style={{
            background: "#1da1f2",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "6px 18px",
            fontSize: "1rem",
            marginTop: "18px"
          }}>Tweet</button>
        </div>
      </div>
      <div className="compose-modal" onClick={e => e.stopPropagation()}>
        <div className="compose-header">
          <span className="modal-title">New Tweet</span>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="compose-body">
          <div className="avatar">R</div>
          <textarea placeholder="What's happening?" />
          <div className="reply-info">Everyone can reply</div>
          <div className="compose-actions">
            {/* Add your icons/buttons here */}
          </div>
          <button className="post-btn">Post</button>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;
