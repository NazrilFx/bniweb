"use client";

import { useState, useEffect } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [output, setOutput] = useState("");
  const [standar, setStandar] = useState("");
  const [rejectedRate, setRejectedRate] = useState("");
  const [downtime, setDowntime] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();

    if (rejectedRate > 100) {
      setMessage("The rejected rate must be below 100%.")
      setLoading(false)
      return false
    }

    try {
      const res = await fetch("/api/machine/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          output,
          standar,
          rejectedRate,
          downtime,
          csrfToken,
        }),
        redirect: "manual",
      });

      // Cek apakah response adalah JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response");
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Create failed");

      setMessage("New  has been made");
      setName("")
      setDescription("")
    } catch (error) {
      let errorMessage = "Internal Server Error";

      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      setMessage(errorMessage);
      console.error("Create error :", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Tambah data</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-500">Machine name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-500">Std Output</label>
            <input
              type="number"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-500">Std Standar</label>
            <input
              type="number"
              value={standar}
              onChange={(e) => setStandar(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-500">Rejected Rate in percentation %</label>
            <input
              type="number"
              value={rejectedRate}
              onChange={(e) => setRejectedRate(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-500">Std Downtime (per hours)</label>
            <input
              type="number"
              step="0.1"
              value={downtime}
              onChange={(e) => setDowntime(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
          {message && <p className="text-red-500 text-sm mb-4">{message}</p>}
        </form>
      </div>
    </div>
  );
}
