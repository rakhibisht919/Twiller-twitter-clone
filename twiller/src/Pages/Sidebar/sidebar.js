import React, { useState } from "react";
import TwitterIcon from "@mui/icons-material/Twitter";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreIcon from "@mui/icons-material/More";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Divider from "@mui/material/Divider";
import DoneIcon from "@mui/icons-material/Done";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "./sidebar.css";
import Customlink from "./Customlink";
import Sidebaroption from "./Sidebaroption";
import { useNavigate } from "react-router-dom";
import useLoggedinuser from "../../hooks/useLoggedinuser";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import ComposePost from "../../components/ComposePost/ComposePost";

const Sidebar = ({ handlelogout, user }) => {
  const [anchorE1, setanchorE1] = useState(null);
  const openmenu = Boolean(anchorE1);
  const [loggedinuser] = useLoggedinuser(); // Removed unused setLoggedinuser and loading variables
  const navigate = useNavigate();
  
  const handleclick = (e) => {
    setanchorE1(e.currentTarget);
  };
  
  const handleclose = () => {
    setanchorE1(null);
  };
  
  const result = user?.email?.split("@")[0];

  return (
    <div className="sidebar">
      <TwitterIcon className="sidebar__twitterIcon" />
      <Customlink to="/">
        <Sidebaroption active Icon={HomeIcon} text="Home" />
      </Customlink>
      <Customlink to="/explore">
        <Sidebaroption Icon={SearchIcon} text="Explore" />
      </Customlink>
      <Customlink to="/notification">
        <Sidebaroption Icon={NotificationsNoneIcon} text="Notifications" />
      </Customlink>
      <Customlink to="/messages">
        <Sidebaroption Icon={MailOutlineIcon} text="Messages" />
      </Customlink>
      <Customlink to="/bookmarks">
        <Sidebaroption Icon={BookmarkBorderIcon} text="Bookmarks" />
      </Customlink>
      <Customlink to="/lists">
        <Sidebaroption Icon={ListAltIcon} text="Lists" />
      </Customlink>
      <Customlink to="/profile">
        <Sidebaroption Icon={PermIdentityIcon} text="Profile" />
      </Customlink>
      <Customlink to="/more">
        <Sidebaroption Icon={MoreIcon} text="More" />
      </Customlink>
      <ComposePost />
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>
      <div className="Profile__info" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
        <Avatar
          src={
            loggedinuser[0]?.profileImage
              ? loggedinuser[0].profileImage
              : user && user.photoURL
          }
        />
        <div className="user__info">
          <h4>
            {loggedinuser[0]?.name
              ? loggedinuser[0].name
              : user && user.displayName}
          </h4>
          <h5>@{result}</h5>
        </div>
        <IconButton
          size="small"
          sx={{ ml: 2 }}
          aria-controls={openmenu ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-valuetext={openmenu ? "true" : undefined}
          onClick={handleclick}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorE1}
          open={openmenu}
          onClick={handleclose}
          onClose={handleclose}
        >
          <MenuItem
            className="Profile__info1"
            onClick={() => navigate("/profile")}
          >
            <Avatar
              src={
                loggedinuser[0]?.profileImage
                  ? loggedinuser[0]?.profileImage
                  : user && user.photoURL
              }
            />
            <div className="user__info subUser__info">
              <div>
                <h4>
                  {loggedinuser[0]?.name
                    ? loggedinuser[0].name
                    : user && user.displayName}
                </h4>
                <h5>@{result}</h5>
              </div>
              <ListItemIcon className="done__icon" color="blue">
                <DoneIcon />
              </ListItemIcon>
            </div>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            handleclose();
            navigate('/signup');
          }}>Add an existing account</MenuItem>
          <MenuItem onClick={handlelogout}>Log out @{result}</MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Sidebar;
