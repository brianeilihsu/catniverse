import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Chart.css";
import backPic from "../../Image/back.png";
import filterPic from "../../Image/filter.png";

ChartJs.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const cities = [
  "臺北市",
  "新北市",
  "桃園市",
  "台中市",
  "臺南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "宜蘭縣",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "臺東縣",
  "花蓮縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

const Chart = () => {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [chartTypes, setChartTypes] = useState({
    total_cat: true,
    ratio: true,
    stray_ratio: true,
  });
  const [chartData, setChartData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedCitiesOrDistricts, setSelectedCitiesOrDistricts] = useState(
    []
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Start loading

      try {
        const response = await fetch(
          `http://140.136.151.71:8787/api/v1/chart/${
            selectedCity === "all" ? "stray/all" : selectedCity
          }`
        );
        const data = await response.json();

        const filteredData = data.data;

        if (selectedCity === "all") {
          const cityOptions = [
            ...new Set(filteredData.map((item) => item.city)),
          ];
          setDistricts(cityOptions);
          setSelectedCitiesOrDistricts(cityOptions); // Select all cities by default
        } else {
          const districtOptions = [
            ...new Set(filteredData.map((item) => item.district)),
          ];
          setDistricts(districtOptions);
          setSelectedCitiesOrDistricts(districtOptions); // Select all districts by default
        }

        setChartData(
          isMobile
            ? generatePieChartData(filteredData)
            : generateBarChartData(filteredData)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Stop loading after fetch completes
      }
    };

    fetchData();
  }, [selectedCity, chartTypes, isMobile]);

  const generateBarChartData = (filteredData) => {
    const datasets = [];

    // Filter data by selected cities or districts
    const filteredBySelection = filteredData.filter((item) => {
      return selectedCity === "all"
        ? selectedCitiesOrDistricts.includes(item.city)
        : selectedCitiesOrDistricts.includes(item.district);
    });

    // 提取 labels 作為最外層的 labels
    const labels =
      selectedCity === "all"
        ? filteredBySelection.map((item) => item.city)
        : filteredBySelection.map((item) => item.district);

    // # 流浪貓總數
    if (chartTypes.total_cat) {
      const totalCats = filteredBySelection.map((item) =>
        Math.floor(item.total_cat)
      );

      datasets.push({
        label: "流浪貓總數",
        data: totalCats,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      });
    }

    // 剪耳比率 (Tipped/Total Cat)
    if (chartTypes.ratio) {
      const ratios = filteredBySelection.map((item) =>
        (item.total_tipped / item.total_cat).toFixed(2)
      );

      datasets.push({
        label: "剪耳比率 (Tipped/Total Cat)",
        data: ratios,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      });
    }

    // 流浪貓比例 (Stray/Total Cat)
    if (chartTypes.stray_ratio) {
      const strayRatios = filteredBySelection.map((item) =>
        (item.total_stray / item.total_cat).toFixed(2)
      );

      datasets.push({
        label: "流浪貓比例 (Stray/Total Cat)",
        data: strayRatios,
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      });
    }

    // 已剪耳且流浪貓佔比 (Tipped Stray/Total Tipped)
    if (chartTypes.tipped_stray_ratio) {
      const tippedStrayRatios = filteredBySelection.map((item) =>
        (item.total_tipped_stray / item.total_tipped).toFixed(2)
      );

      datasets.push({
        label: "已剪耳且流浪貓佔比 (Tipped Stray/Total Tipped)",
        data: tippedStrayRatios,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      });
    }

    // 未剪耳且流浪的貓佔比 ((Total Stray - Tipped Stray) / Total Cat)
    if (chartTypes.untipped_stray_ratio) {
      const untippedStrayRatios = filteredBySelection.map((item) =>
        ((item.total_stray - item.total_tipped_stray) / item.total_cat).toFixed(
          2
        )
      );

      datasets.push({
        label: "未剪耳且流浪的貓佔比",
        data: untippedStrayRatios,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      });
    }

    return {
      labels: labels,
      datasets: datasets,
    };
  };

  const generatePieChartData = (filteredData) => {
    const datasets = [];

    // 過濾選定的城市或地區的數據
    const filteredBySelection = filteredData.filter((item) => {
      return selectedCity === "all"
        ? selectedCitiesOrDistricts.includes(item.city)
        : selectedCitiesOrDistricts.includes(item.district);
    });

    // 流浪貓總數
    if (chartTypes.total_cat) {
      const labels =
        selectedCity === "all"
          ? filteredBySelection.map((item) => item.city)
          : filteredBySelection.map((item) => item.district);
      const totalCats = filteredBySelection.map((item) =>
        Math.floor(item.total_cat)
      );

      datasets.push({
        label: "流浪貓總數",
        data: totalCats,
        backgroundColor: generateColors(totalCats.length),
        labels: labels,
      });
    }

    // 剪耳比率 (Tipped/Total Cat)
    if (chartTypes.ratio) {
      const labels =
        selectedCity === "all"
          ? filteredBySelection.map((item) => item.city)
          : filteredBySelection.map((item) => item.district);
      const ratios = filteredBySelection.map((item) =>
        (item.total_tipped / item.total_cat).toFixed(2)
      );

      datasets.push({
        label: "剪耳比率 (Tipped/Total Cat)",
        data: ratios,
        backgroundColor: generateColors(ratios.length),
        labels: labels,
      });
    }

    // 流浪貓比例 (Stray/Total Cat)
    if (chartTypes.stray_ratio) {
      const labels =
        selectedCity === "all"
          ? filteredBySelection.map((item) => item.city)
          : filteredBySelection.map((item) => item.district);
      const strayRatios = filteredBySelection.map((item) =>
        (item.total_stray / item.total_cat).toFixed(2)
      );

      datasets.push({
        label: "流浪貓比例 (Stray/Total Cat)",
        data: strayRatios,
        backgroundColor: generateColors(strayRatios.length),
        labels: labels,
      });
    }

    // 已剪耳且流浪貓佔比 (Tipped Stray/Total Tipped)
    if (chartTypes.tipped_stray_ratio) {
      const labels =
        selectedCity === "all"
          ? filteredBySelection.map((item) => item.city)
          : filteredBySelection.map((item) => item.district);
      const tippedStrayRatios = filteredBySelection.map((item) =>
        (item.total_tipped_stray / item.total_tipped).toFixed(2)
      );

      datasets.push({
        label: "已剪耳且流浪貓佔比 (Tipped Stray/Total Tipped)",
        data: tippedStrayRatios,
        backgroundColor: generateColors(tippedStrayRatios.length),
        labels: labels,
      });
    }

    // 未剪耳且流浪的貓佔比 ((Total Stray - Tipped Stray) / Total Cat)
    if (chartTypes.untipped_stray_ratio) {
      const labels =
        selectedCity === "all"
          ? filteredBySelection.map((item) => item.city)
          : filteredBySelection.map((item) => item.district);
      const untippedStrayRatios = filteredBySelection.map((item) =>
        ((item.total_stray - item.total_tipped_stray) / item.total_cat).toFixed(
          2
        )
      );

      datasets.push({
        label: "未剪耳且流浪的貓佔比",
        data: untippedStrayRatios,
        backgroundColor: generateColors(untippedStrayRatios.length),
        labels: labels,
      });
    }

    return { datasets };
  };

  const handleCheckboxChange = (event) => {
    setChartTypes({ ...chartTypes, [event.target.name]: event.target.checked });
  };

  const handleDistrictCheckboxChange = (event) => {
    const name = event.target.name;
    if (event.target.checked) {
      setSelectedCitiesOrDistricts([...selectedCitiesOrDistricts, name]);
    } else {
      setSelectedCitiesOrDistricts(
        selectedCitiesOrDistricts.filter((item) => item !== name)
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://140.136.151.71:8787/api/v1/chart/${
          selectedCity === "all" ? "stray/all" : selectedCity
        }`
      );
      const data = await response.json();

      const filteredData = data.data;
      if (isMobile) {
        setChartData(generatePieChartData(filteredData));
      } else {
        setChartData(generateBarChartData(filteredData));
      }
    };

    fetchData();
  }, [selectedCitiesOrDistricts, isMobile]);

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `資料 - ${selectedCity}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "數量或比例",
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  const generateColors = (length) => {
    const colors = [];
    for (let i = 0; i < length; i++) {
      const hue = 0;
      const saturation = 40 + ((i * 5) % 40);
      const lightness = 50 + ((i * 10) % 30);
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <ClipLoader color={"#666"} size={50} />
        </div>
      )}
      {isMobile ? (
        <div className="mobile-wrapper">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="mobile-sidebar-toggle-button"
            >
              <img
                src={filterPic}
                style={{ width: "25px", height: "25px" }}
              ></img>
            </button>
          )}

          {isSidebarOpen && (
            <div
              className="mobile-sidebar-overlay"
              onClick={closeSidebar}
            ></div>
          )}

          <div className="mobile-all-container">
            <div className="mobile-charts-container">
              {chartData &&
                chartData.datasets &&
                chartData.datasets.length > 0 &&
                chartData.datasets.map((dataset, index) => (
                  <div key={index} className="pie-chart">
                    <h3>{dataset.label}</h3>
                    <Pie
                      options={pieOptions}
                      data={{
                        labels: dataset.labels,
                        datasets: [
                          {
                            data: dataset.data,
                            backgroundColor: dataset.backgroundColor,
                          },
                        ],
                      }}
                    />
                  </div>
                ))}
            </div>
            {isSidebarOpen && (
              <div className="mobile-chart-sidebar">
                <div className="mobile-select-container">
                  <div>
                    <label htmlFor="city-select">選擇城市: </label>
                    <select
                      id="city-select"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                    >
                      <option value="all">全部城市</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>
                      選擇{selectedCity === "all" ? "城市" : "地區"}:{" "}
                    </label>
                    <div className="checkbox-container">
                      {districts.map((option) => (
                        <div key={option} className="checkbox-item">
                          <input
                            type="checkbox"
                            name={option}
                            checked={selectedCitiesOrDistricts.includes(option)}
                            onChange={handleDistrictCheckboxChange}
                          />
                          <label htmlFor={option}>{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <br />
                  <div>
                    <label>選擇圖表類型: </label>
                    <div>
                      <input
                        type="checkbox"
                        name="total_cat"
                        checked={chartTypes.total_cat}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="total_cat">流浪貓總數</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="ratio"
                        checked={chartTypes.ratio}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="ratio">剪耳比率 (Tipped/Total)</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="stray_ratio"
                        checked={chartTypes.stray_ratio}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="stray_ratio">
                        流浪貓比例 (Stray/Total)
                      </label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="tipped_ratio"
                        checked={chartTypes.tipped_ratio}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="tipped_ratio">
                        剪耳貓佔比 (Tipped/Total Cat)
                      </label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="tipped_stray_ratio"
                        checked={chartTypes.tipped_stray_ratio}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="tipped_stray_ratio">
                        剪耳流浪貓佔比 (Tipped Stray/Total Tipped)
                      </label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        name="untipped_stray_ratio"
                        checked={chartTypes.untipped_stray_ratio}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="untipped_stray_ratio">
                        未剪耳且流浪的貓佔比
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="wrapper">
          <div className="backLogo">
            <Link to={`/`} className="back-container">
              <button className="back-btn">
                <img className="backPic" src={backPic} alt="back" />
              </button>
              <p>Back</p>
            </Link>
          </div>
          <div className="all-container">
            <div className="select-container">
              <div>
                <label htmlFor="city-select">選擇城市: </label>
                <select
                  id="city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="all">全部城市</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>選擇{selectedCity === "all" ? "城市" : "地區"}: </label>
                {districts.map((option) => (
                  <div key={option}>
                    <input
                      type="checkbox"
                      name={option}
                      checked={selectedCitiesOrDistricts.includes(option)}
                      onChange={handleDistrictCheckboxChange}
                    />
                    <label htmlFor={option}>{option}</label>
                  </div>
                ))}
              </div>
              <br />
              <div>
                <label>選擇圖表類型: </label>
                <div>
                  <input
                    type="checkbox"
                    name="total_cat"
                    checked={chartTypes.total_cat}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="total_cat">流浪貓總數</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="ratio"
                    checked={chartTypes.ratio}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="ratio">剪耳比率 (Tipped/Total)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="stray_ratio"
                    checked={chartTypes.stray_ratio}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="stray_ratio">流浪貓比例 (Stray/Total)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="tipped_ratio"
                    checked={chartTypes.tipped_ratio}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="tipped_ratio">
                    剪耳貓佔比 (Tipped/Total Cat)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="tipped_stray_ratio"
                    checked={chartTypes.tipped_stray_ratio}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="tipped_stray_ratio">
                    剪耳流浪貓佔比 (Tipped Stray/Total Tipped)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="untipped_stray_ratio"
                    checked={chartTypes.untipped_stray_ratio}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="untipped_stray_ratio">
                    未剪耳且流浪的貓佔比
                  </label>
                </div>
              </div>
            </div>

            <div className="charts-container">
              {chartData && chartData.datasets.length > 0 && (
                <Bar options={barOptions} data={chartData} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chart;
