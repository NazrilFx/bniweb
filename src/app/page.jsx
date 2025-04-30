"use client";

import {
  FaTachometerAlt,
  FaBoxOpen,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
} from "react-icons/fa";
import "./globals.css";

export default function DashboardPage() {
  const username = "JohnDoe"; // Ganti ini kalau kamu mau ambil dari context/auth nanti
  return (
    <div className="dashboard">
      {/* Main Content */}
      <main className="main-content">
        <div className="header">
          <div className="page-title">
            <h1>Production Performance Dashboard</h1>
            <p>Welcome back, {username}</p>
          </div>
          <div className="user-info">
            <div className="date-picker">
              <select className="date-select">
                <option>Daily</option>
                <option defaultChecked>Weekly</option>
                <option>Monthly</option>
              </select>
              <select className="date-select">
                <option>January 2025</option>
                <option>February 2025</option>
                <option defaultChecked>March 2025</option>
                <option>April 2025</option>
              </select>
            </div>
            <div className="user-profile">
              <div className="user-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
              <span>{username}</span>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="metric-cards">
          <div className="card metric-card">
            <div className="label">
              <FaBoxOpen />
              Total Production
            </div>
            <div className="value">24,850</div>
            <div className="change positive">
              <FaArrowUp />
              8.4% vs Target
            </div>
          </div>
          <div className="card metric-card">
            <div className="label">
              <FaTachometerAlt />
              Average Efficiency
            </div>
            <div className="value">76%</div>
            <div className="change negative">
              <FaArrowDown />
              4% vs Last Week
            </div>
          </div>
          <div className="card metric-card">
            <div className="label">
              <FaCheckCircle />
              Quality Rate
            </div>
            <div className="value">98%</div>
            <div className="change warning">
              <FaArrowDown />
              2% vs Last Month
            </div>
          </div>
          <div className="card metric-card">
            <div className="label">
              <i className="fas fa-clock"></i>
              Downtime
            </div>
            <div className="value">6.5 hrs</div>
            <div className="change warning">
              <i className="fas fa-arrow-up"></i>
              2.1 hrs vs Target
            </div>
          </div>
        </div>

        {/* Chart Grid */}
        <div className="chart-grid">
          <div className="card">
            <h3 className="chart-title">Production Output vs Standard</h3>
            <div className="chart-container">
              <div className="bar-chart">
                <div className="bar-group">
                  <div className="bar output" style={{ height: "65%" }}></div>
                  <div className="bar standard" style={{ height: "60%" }}></div>
                </div>
                <div className="bar-group">
                  <div className="bar output" style={{ height: "78%" }}></div>
                  <div className="bar standard" style={{ height: "70%" }}></div>
                </div>
                <div className="bar-group">
                  <div className="bar output" style={{ height: "90%" }}></div>
                  <div className="bar standard" style={{ height: "85%" }}></div>
                </div>
                <div className="bar-group">
                  <div className="bar output" style={{ height: "95%" }}></div>
                  <div className="bar standard" style={{ height: "80%" }}></div>
                </div>
                <div className="bar-group">
                  <div className="bar output" style={{ height: "75%" }}></div>
                  <div className="bar standard" style={{ height: "90%" }}></div>
                </div>
              </div>
              <div className="x-axis">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "var(--primary)" }}
                  ></div>
                  <div>Actual Output</div>
                </div>
                <div className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: "var(--primary-light)" }}
                  ></div>
                  <div>Standard Target</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="chart-title">Overall Efficiency</h3>
            <div className="chart-container">
              <div className="efficiency-chart">
                <div className="efficiency-inner">
                  <div className="efficiency-value">76%</div>
                  <div className="efficiency-label">Efficiency Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <h3 className="chart-title">Production Line Performance</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Output</th>
                  <th>Standard</th>
                  <th>Variance</th>
                  <th>Efficiency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Line A</td>
                  <td>5,280</td>
                  <td>5,000</td>
                  <td className="positive">+5.6%</td>
                  <td>82%</td>
                  <td>
                    <span className="status-badge status-on-target">
                      On Target
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Line B</td>
                  <td>6,450</td>
                  <td>6,000</td>
                  <td className="positive">+7.5%</td>
                  <td>85%</td>
                  <td>
                    <span className="status-badge status-on-target">
                      On Target
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Line C</td>
                  <td>4,320</td>
                  <td>5,000</td>
                  <td className="negative">-13.6%</td>
                  <td>58%</td>
                  <td>
                    <span className="status-badge status-below-target">
                      Below Target
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Line D</td>
                  <td>8,800</td>
                  <td>8,000</td>
                  <td className="positive">+10.0%</td>
                  <td>79%</td>
                  <td>
                    <span className="status-badge status-on-target">
                      On Target
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
