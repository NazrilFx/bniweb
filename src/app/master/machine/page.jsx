"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../../master.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default function DataProduksiMesin() {
  // date
  const [date, setDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [shift, setShift] = useState("day");
  const [finalDate, setFinalDate] = useState("");
  const [targetName, setTargetName] = useState("");

  const [newName, setNewName] = useState("");
  const [newStandarId, setNewStandarId] = useState("");
  const [newOutput, setNewOutput] = useState("");
  const [newRejectedRate, setNewRejectedRate] = useState("");
  const [newDowntime, setNewDowntime] = useState("");
  const [data, setData] = useState([]);
  const [filterMesin, setFilterMesin] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalStandarOpen, setIsModalStandarOpen] = useState(false);

  const [csrfToken, setCsrfToken] = useState("");
  const [standar, setStandar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetStandar, setTargerStandar] = useState("");
  const [targetActual, setTargerActual] = useState("");
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [actual, setActual] = useState([]);
  const [updatedActual, setUpdatedActual] = useState([]);
  const [user, setUser] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const [newDate, setNewDate] = useState("");
  const [newShift, setNewShift] = useState("");
  const [newFullDate, setNewFullDate] = useState("");

  useEffect(() => {
    console.log(finalDate);
  }, [finalDate]);

  useEffect(() => {
    setLoading(true);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Format YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split("T")[0];

    setFilterTo(formatDate(today));
    setFilterFrom(formatDate(sevenDaysAgo));
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setIsAdmin(data.user.isAdmin);
        } else {
          console.error("response tidak ok");
        }
      } catch (error) {
        console.error(error);
      }
    };

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

    const fetchActual = async () => {
      try {
        const res = await fetch("/api/actual");
        const data = await res.json();

        if (res.ok) {
          setActual(data.data);
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

    fetchUser();
    fetchStandar();
    fetchActual().then(() => {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    });
  }, []);

  useEffect(() => {
    const result = updatedActual.filter((d) => {
      const isMesinMatch =
        !filterMesin || d.name.toLowerCase() === filterMesin.toLowerCase();
      const isFromMatch =
        !filterFrom || new Date(d.date) >= new Date(filterFrom);
      const isToMatch = !filterTo || new Date(d.date) <= new Date(filterTo);
      return isMesinMatch && isFromMatch && isToMatch;
    });

    setFilteredData(result);
  }, [filterFrom, filterTo, updatedActual, filterMesin]);

  // const (e) => setNewName(e.target.value)} = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.id.replace("input", "").toLowerCase()]: e.target.value,
  //   });
  // }

  useEffect(() => {
    const result = actual.map((ac) => {
      // cari standar yang cocok (ambil yang pertama karena nama unik)
      const std = standar.find((item) => item._id === ac.standarId) || {};

      // hitung
      const rejectedRate =
        ((ac.rejectRate / ac.output) * 100).toFixed(2) + " %";
      const downtimeRate = ((ac.downtime / ac.output) * 100).toFixed(2) + " %";
      const stdDowntimeRate =
        ((std.downtime / std.output) * 100).toFixed(2) + " %";
      const selisihOutput = ac.output - (std.output || 0) + " unit";
      const selisihReject =
        ((ac.rejectRate / ac.output) * 100 - (std.rejectRate || 0)).toFixed(2) +
        " %";

      const dt = dayjs.utc(ac.date).local(); // 1. parse dan konversi ke local
      const date = dt.format("YYYY-MM-DD"); // 2. ambil string tanggal & jam
      const hour = dt.hour(); // 3. ambil angka jam (0–23)
      const shift =
        hour >= 6 && hour < 18 // 4. tentukan day/night
          ? "day"
          : "night";

      return {
        _id: ac._id.toString(),
        originalDate: ac.date,
        date,
        shift,
        standarId: ac.standarId,
        name: std.name,
        output: ac.output,
        rejectRate: ac.rejectRate,
        rejectedRate,
        stdOutput: std.output,
        stdRejectRate: std.rejectRate,
        selisihOutput,
        selisihReject,
        stdDowntimeRate,
        downtimeRate,
        downtime: ac.downtime,
      };
    });

    setUpdatedActual(result);
  }, [actual, standar]);

  useEffect(() => {
    if (!newDate) return;

    try {
      // Pecah newDate menjadi bagian tahun, bulan, dan hari
      const [year, month, day] = newDate.split("-").map(Number);

      // Set tanggal dan waktu menggunakan Date.UTC untuk menghindari masalah zona waktu
      let parsed = new Date(Date.UTC(year, month - 1, day));

      if (isNaN(parsed.getTime())) {
        console.error("Invalid date string:", newDate);
        alert("Tanggal tidak valid");
        return;
      }

      // Set jam sesuai shift
      if (newShift === "day") {
        parsed.setUTCHours(6, 1, 0, 0); // Set waktu ke 00:00:00 UTC
      } else {
        parsed.setUTCHours(19, 0, 0, 0); // Set waktu ke 18:01:00 UTC
      }

      const isoWithOffset = dayjs.utc(parsed).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      setFinalDate(isoWithOffset);
    } catch (err) {
      console.error("Gagal parsing date:", newDate, err);
    }
  }, [newShift, newDate]);


  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin hapus data ini?",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      icon: "warning",
    }).then(async () => {
      const res = await fetch("/api/actual/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
          id,
        }),
      });

      if (res.ok) {
        Swal.fire("Terhapus!", "", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
          date: finalDate,
          id: targetActual,
          standarId: newStandarId,
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
    }
  };

  const handleDeleteStandar = (id) => {
    Swal.fire({
      title:
        "Yakin hapus data ini? Data Actual Terkait Juga mungkin akan Rusak Bila Data Standar Dihapus",
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
          id,
        }),
      });

      if (res.ok) {
        Swal.fire("Terhapus!", "", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
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
          date,
          standarId: newStandarId,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading machine...</p>
      </div>
    );
  }

  if (!loading && !user.isActive) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
        <p>
          Akun anda dalam keadaan tidak aktif, silahkan hubungi admin untuk
          mengaktifkan akun anda
        </p>
      </div>
    );
  }

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
            {standar.map((std, i) => (
              <option key={i} value={std.name}>
                {std.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={() => setIsModalOpen(true)}>
            + Tambah Data <b>Aktual</b>
          </button>
        </div>
      </div>

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
            <th>Actual Rejected Rate</th>
            <th>Std Output</th>
            <th>Std Reject</th>
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
              <td>
                {d.date} / {d.shift}
              </td>
              <td>{d.name}</td>
              <td>{d.output}</td>
              <td>{d.rejectRate}</td>
              <td>{d.rejectedRate}</td>
              <td>{d.stdOutput} unit</td>
              <td>{d.stdRejectRate}</td>
              <td>{d.selisihOutput}</td>
              <td>{d.selisihReject}</td>
              <td>{d.stdDowntimeRate}</td>
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
                  onClick={() => {
                    setIsModalEditOpen(true);
                    setNewDate(d.date);
                    setNewShift(d.shift);
                    setTargerActual(d._id);
                    setTargetName(d.name);
                    setNewStandarId(d.standarId);
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

      {/* Modal Untuk Aktual */}
      {isModalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>
              Tambah Data Produksi <b>Aktual</b>
            </h3>
            <label className="block">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border px-2 py-1"
              required
            />
            <label className="block">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="day">Day (00:00 - 18:00)</option>
              <option value="night">Night (18:01 - 23:59)</option>
            </select>
            <label>
              Mesin:
              <select
                id="inputMesin"
                value={newStandarId}
                onChange={(e) => setNewStandarId(e.target.value)}
              >
                <option value="">-- Pilih Mesin --</option>
                {standar.map((s, i) => (
                  <option key={i} value={s._id.toString()}>
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

      {isModalEditOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>
              Edit Data Produksi <b>Aktual</b>
            </h3>

            <label className="block">Tanggal</label>
            <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
            <label className="block">Shift</label>
            <select
              value={newShift}
              onChange={(e) => setNewShift(e.target.value)}
              className="border px-2 py-1"
            >
              <option value="day">Day (00:00 - 18:00)</option>
              <option value="night">Night (18:01 - 23:59)</option>
            </select>
            <label>
              Mesin:
              <select
                id="inputMesin"
                value={newStandarId}
                onChange={(e) => setNewStandarId(e.target.value)}
              >
                <option value="">Pilih mesin</option>
                {standar.map((s, i) => (
                  <option key={i} value={s._id.toString()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Actual Output:
              <input
                type="number"
                id="inputOutput"
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
              />
            </label>
            <label>
              Actual Reject:
              <input
                type="number"
                id="inputReject"
                value={newRejectedRate}
                onChange={(e) => setNewRejectedRate(e.target.value)}
              />
            </label>
            <label>
              Actual Downtime (jam):
              <input
                type="number"
                id="inputDowntime"
                value={newDowntime}
                onChange={(e) => setNewDowntime(e.target.value)}
              />
            </label>
            <button className="btn" onClick={handleEdit}>
              Edit
            </button>
            <button
              className="cancel-btn btn"
              onClick={() => setIsModalEditOpen(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
