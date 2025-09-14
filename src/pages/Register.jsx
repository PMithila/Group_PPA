// Register.jsx
import React, { useState } from "react";
import { register, setToken } from "../api";

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    const data = await register(email, password);
    const token = data.access_token;
    localStorage.setItem("adv_token", token);
    setToken(token);
    onRegister();
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2"/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2"/>
        <button className="px-4 py-2 bg-green-600 text-white rounded">Register</button>
      </form>
    </div>
  );
}
