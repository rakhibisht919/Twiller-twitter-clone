import React, { useState } from "react";
import "./widget.css";
import SearchIcon from "@mui/icons-material/Search";

const Widgets = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="widgets">
      <div className="widgets__input">
        <SearchIcon className="widget__searchIcon" />
        <input 
          placeholder="Search Twitter" 
          type="text" 
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="widgets__widgetContainer">
        <h2>What's Happening</h2>
        
        <div className="empty-state">
          <p className="empty-message">No trending topics available at the moment.</p>
          <p className="empty-suggestion">Check back later for trending content!</p>
        </div>
      </div>
    </div>
  );
};

export default Widgets;
