"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../../master.css";

export default function DataProduksiMesin() {
  const [newName, setNewName] = useState("");
  const [newOutput, setNewOutput] = useState("");
  const [newRejectedRate, setNewRejectedRate] = useState("");
  const [newDowntime, setNewDowntime] = useState("");
  const [data, setData] = useState([]);
  const [filterMesin, setFilterMesin] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [formData, setFormData] = useState({
    mesin: "",
    output: "",
    reject: "",
    downtime: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalStandarOpen, setIsModalStandarOpen] = useState(false);

  const [csrfToken, setCsrfToken] = useState("");
  const [standar, setStandar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetStandar, setTargerStandar] = useState("");
  const [isModalStandarEditOpen, setIsModalStandarEditOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const mesinStandar = {
    "Extruder 1": { output: 587, rejectRate: 4.9, downtimeRate: 3.69 },
    "Extruder 2": { output: 623, rejectRate: 3.8, downtimeRate: 2.95 },
    "Extruder 3": { output: 565, rejectRate: 2.5, downtimeRate: 4.3 },
    "Extruder 4": { output: 565, rejectRate: 2.5, downtimeRate: 1.13 },
    "Extruder 5": { output: 565, rejectRate: 2.5, downtimeRate: 4.23 },
    "Extruder 6": { output: 565, rejectRate: 2.5, downtimeRate: 3.26 },
    "Extruder 7": { output: 565, rejectRate: 2.5, downtimeRate: 2.19 },
    "Extruder 8": { output: 565, rejectRate: 2.5, downtimeRate: 1.19 },
    "Extruder 9": { output: 565, rejectRate: 2.5, downtimeRate: 4.96 },
    "Extruder 10": { output: 565, rejectRate: 2.5, downtimeRate: 1.03 },
    "Extruder 11": { output: 565, rejectRate: 2.5, downtimeRate: 4.08 },
    "Extruder 12": { output: 565, rejectRate: 2.5, downtimeRate: 3.99 },
    "Extruder 13": { output: 565, rejectRate: 2.5, downtimeRate: 2.51 },
  };
  useEffect(() => {
    console.log(targetStandar);
  }, [targetStandar]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      tanggal: new Date().toISOString().split("T")[0],
    }));

    const fetchStandar = async () => {
      try {
        const res = await fetch("/api/standar");
        const data = await res.json();

        if (res.ok) {
          setStandar(data.data);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetch("/api/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken));

    fetchStandar();
  }, []);

  // const (e) => setNewName(e.target.value)} = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.id.replace("input", "").toLowerCase()]: e.target.value,
  //   });
  // };

  const handleSubmit = () => {
    const { mesin, output, reject, downtime } = formData;
    const std = mesinStandar[mesin];
    if (!mesin || !output || !reject || !downtime) {
      Swal.fire("Lengkapi data terlebih dahulu!", "", "warning");
      return;
    }

    const outputInt = parseInt(output);
    const rejectInt = parseInt(reject);
    const downtimeInt = parseInt(downtime);

    const rejectRate = ((rejectInt / outputInt) * 100).toFixed(2) + " %";
    const downtimeRate = ((downtimeInt / outputInt) * 100).toFixed(2) + " %";
    const selisihOutput = outputInt - std.output + " unit";
    const selisihReject =
      ((rejectInt / outputInt) * 100 - std.rejectRate).toFixed(2) + " %";

    const newData = {
      mesin,
      output: outputInt,
      reject: rejectInt,
      rejectRate,
      downtimeRate,
      stdDowntimeRate: std.downtimeRate,
      selisihOutput,
      selisihReject,
      stdOutput: std.output,
      stdRejectRate: std.rejectRate,
    };

    const updatedData = [...data];
    if (editIndex !== null) {
      updatedData[editIndex] = newData;
      setEditIndex(null);
    } else {
      updatedData.push(newData);
    }

    setData(updatedData);
    setFormData({
      mesin: "",
      output: "",
      reject: "",
      downtime: "",
    });
    setIsModalOpen(false);
    Swal.fire("Berhasil", "Data telah disimpan!", "success");
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus data ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      icon: "warning",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = [...data];
        updated.splice(id, 1);
        setData(updated);
        Swal.fire("Terhapus!", "", "success");
      }
    });
  };

  const handleEdit = async () => {
    try {
      const res = await fetch("/api/actual/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id,
          name: "Standar Baru",
          output: 100,
          rejectRate: 5.5,
          downtime: 2,
        }),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Data telah diupdate!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error("response tidak ok");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteStandar = (index) => {
    Swal.fire({
      title: "Yakin hapus data ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      icon: "warning",
    }).then(async () => {
      const res = await fetch("/api/standar/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id: targetStandar,
        }),
      });
    });
  };

  const handleEditStandar = async () => {
    try {
      const res = await fetch("/api/standar/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id: targetStandar,
          name: newName,
          output: newOutput,
          rejectRate: newRejectedRate,
          downtime: newDowntime,
        }),
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Data telah diupdate!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error("response tidak ok");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTargerStandar("");
      setLoading(false);
      setNewName("");
      setNewOutput("");
      setNewDowntime("");
      setNewRejectedRate("");
    }
  };

  const filteredData = data.filter((d) => {
    const isMesinMatch = !filterMesin || d.mesin === filterMesin;
    const isFromMatch =
      !filterFrom || new Date(d.tanggal) >= new Date(filterFrom);
    const isToMatch = !filterTo || new Date(d.tanggal) <= new Date(filterTo);
    return isMesinMatch && isFromMatch && isToMatch;
  });

  const CreateStandar = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/standar/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          name: newName,
          output: newOutput,
          rejectRate: newRejectedRate,
          downtime: newDowntime,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setData((prev) => [...prev, data]);
        setIsModalOpen(false);
        Swal.fire("Berhasil", "Data telah disimpan!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        Swal.fire("Gagal", `${data.message}`, "error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setNewName("");
      setNewOutput("");
      setNewDowntime("");
      setNewRejectedRate("");
    }
  };
  const CreateActual = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/actual/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          name: newName,
          output: newOutput,
          rejectRate: newRejectedRate,
          downtime: newDowntime,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setData((prev) => [...prev, data]);
        setIsModalStandarOpen(false);
        Swal.fire("Berhasil", "Data telah disimpan!", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        Swal.fire("Gagal", `${data.message}`, "error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setNewName("");
      setNewOutput("");
      setNewDowntime("");
      setNewRejectedRate("");
    }
  };

  return (
    <div>
      <div className="header">
        <div className="filters">
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
          <select
            value={filterMesin}
            onChange={(e) => setFilterMesin(e.target.value)}
          >
            <option value="">Semua Mesin</option>
            {Object.keys(mesinStandar).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => setIsModalStandarOpen(true)}>
            + Tambah Data <b>Standar</b>
          </button>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            + Tambah Data <b>Aktual</b>
          </button>
        </div>
      </div>

      <h2>
        Data Produksi <b>Standar</b> Mesin
      </h2>

      <table id="dataTable">
        <thead>
          <tr>
            <th>Mesin</th>
            <th>Std Output</th>
            <th>Std Reject Rate</th>
            <th>Std Downtime Rate</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          {standar.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.output}</td>
              <td>{d.rejectRate}</td>
              <td>{d.downtime} %</td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => handleDeleteStandar(d._id.toString())}
                >
                  Hapus
                </button>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setIsModalStandarEditOpen(true);
                    setTargerStandar(d._id.toString());
                    setNewName(d.name);
                    setNewOutput(d.output);
                    setNewRejectedRate(d.rejectRate);
                    setNewDowntime(d.downtime);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>
        Data Produksi <b>Aktual</b> Mesin
      </h2>
      <table id="dataTable">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Mesin</th>
            <th>Actual Output</th>
            <th>Actual Reject</th>
            <th>Actual Reject Rate</th>
            <th>Std Output</th>
            <th>Std Reject Rate</th>
            <th>Selisih Output</th>
            <th>Selisih Reject Rate</th>
            <th>Std Downtime Rate</th>
            <th>Actual Downtime Rate</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          {filteredData.map((d, i) => (
            <tr key={i}>
              <td>{d.tanggal}</td>
              <td>{d.mesin}</td>
              <td>{d.output}</td>
              <td>{d.reject}</td>
              <td>{d.rejectRate}</td>
              <td>{d.stdOutput} unit</td>
              <td>{d.stdRejectRate} %</td>
              <td>{d.selisihOutput}</td>
              <td>{d.selisihReject}</td>
              <td>{d.stdDowntimeRate} %</td>
              <td>{d.downtimeRate}</td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => handleDelete(d._id.toString())}
                >
                  Hapus
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(d._id.toString())}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Untuk Aktual */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>Tambah Data Produksi</h3>
            <label>
              Mesin:
              <select
                id="inputMesin"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              >
                <option value="">-- Pilih Mesin --</option>
                {standar.map((s, i) => (
                  <option key={i} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Output Aktual:
              <input
                type="number"
                id="inputOutput"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
              />
            </label>
            <label>
              Reject Aktual:
              <input
                type="number"
                id="inputReject"
                value={newRejectedRate}
                onChange={(e) => setNewRejectedRate(e.target.value)}
              />
            </label>
            <label>
              Downtime Aktual (jam):
              <input
                type="number"
                id="inputDowntime"
                value={newDowntime}
                onChange={(e) => setNewDowntime(e.target.value)}
              />
            </label>
            <button className="btn" onClick={CreateActual}>
              Simpan
            </button>
            <button
              className="cancel-btn btn"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Modal Untuk Standar */}
      {isModalStandarOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>
              Tambah Data Produksi <b>Standar</b>
            </h3>

            <label>
              Machine Standar Name
              <input
                type="text"
                id="inputOutput"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <label>
              Standar Output:
              <input
                type="number"
                id="inputOutput"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
              />
            </label>
            <label>
              Standar Reject:
              <input
                type="number"
                id="inputReject"
                value={newRejectedRate}
                onChange={(e) => setNewRejectedRate(e.target.value)}
              />
            </label>
            <label>
              Standar Downtime (jam):
              <input
                type="number"
                id="inputDowntime"
                value={newDowntime}
                onChange={(e) => setNewDowntime(e.target.value)}
              />
            </label>
            <button className="btn" onClick={CreateStandar}>
              Simpan
            </button>
            <button
              className="cancel-btn btn"
              onClick={() => setIsModalStandarOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {isModalEditOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>
              Edit Data Produksi <b>Aktual</b>
            </h3>

            <label>
              Machine Standar Name
              <input
                type="text"
                id="inputOutput"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <label>
              Standar Output:
              <input
                type="number"
                id="inputOutput"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
              />
            </label>
            <label>
              Standar Reject:
              <input
                type="number"
                id="inputReject"
                value={newRejectedRate}
                onChange={(e) => setNewRejectedRate(e.target.value)}
              />
            </label>
            <label>
              Standar Downtime (jam):
              <input
                type="number"
                id="inputDowntime"
                value={newDowntime}
                onChange={(e) => setNewDowntime(e.target.value)}
              />
            </label>
            <button className="btn" onClick={handleEditStandar}>
              Edit
            </button>
            <button
              className="cancel-btn btn"
              onClick={() => setIsModalStandarEditOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {isModalStandarEditOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>
              Edit Data Produksi <b>Standar</b>
            </h3>

            <label>
              Machine Standar Name
              <input
                type="text"
                id="inputOutput"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <label>
              Standar Output:
              <input
                type="number"
                id="inputOutput"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
              />
            </label>
            <label>
              Standar Reject:
              <input
                type="number"
                id="inputReject"
                value={newRejectedRate}
                onChange={(e) => setNewRejectedRate(e.target.value)}
              />
            </label>
            <label>
              Standar Downtime (jam):
              <input
                type="number"
                id="inputDowntime"
                value={newDowntime}
                onChange={(e) => setNewDowntime(e.target.value)}
              />
            </label>
            <button className="btn" onClick={handleEditStandar}>
              Edit
            </button>
            <button
              className="cancel-btn btn"
              onClick={() => setIsModalStandarEditOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
