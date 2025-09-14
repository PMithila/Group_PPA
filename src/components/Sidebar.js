// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ menuItems, collapsed }) => {
  const location = useLocation();

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo">
        <i className="fas fa-calendar-alt"></i>
        {!collapsed && <h1>Timetable Manager</h1>}
      </div>
      <div className="menu">
        {menuItems.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
      </div>
      <div className="sidebar-footer">
        {!collapsed && <p>STMS v1.0</p>}
      </div>
    </div>
  );
};

export default Sidebar;