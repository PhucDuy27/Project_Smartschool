// Khởi tạo các thông số cho nút và hình ảnh
const btn1 = document.querySelector("#btn1");
const img1 = document.querySelector("#maylanh");
const btn2 = document.querySelector("#btn2");

btn1.addEventListener("click", () => {
  img1.src = "images/maylanh.gif";
  img1.classList.add("active");
});
btn2.addEventListener("click", () => {
  img1.src = "images/maylanh.png";
  img1.classList.remove("active");
});

const btn3 = document.querySelector("#btn3");
const img2 = document.querySelector("#lamp");
const btn4 = document.querySelector("#btn4");

btn3.addEventListener("click", () => {
  img2.src = "images/lamp.gif";
  img2.classList.add("active");
});
btn4.addEventListener("click", () => {
  img2.src = "images/lamp.png";
  img2.classList.remove("active");
});

const btn5 = document.querySelector("#btn5");
const img3 = document.querySelector("#warning");
const btn6 = document.querySelector("#btn6");

btn5.addEventListener("click", () => {
  img3.src = "images/warning_gif.webp";
  img3.classList.add("active");
});
btn6.addEventListener("click", () => {
  img3.src = "images/warning.png";
  img3.classList.remove("active");
});

// Tích hợp biểu đồ và dữ liệu từ Firebase
document.addEventListener("DOMContentLoaded", function () {
  const nhietdo = document.getElementById("nhietdo");
  const doam = document.getElementById("doam");
  const thanhvien = document.getElementById("thanhvien");

  const dbRef_ph = firebase.database().ref("Phonghop");
  const dbRef_plv = firebase.database().ref("Phonglamviec");
  const dbRef_pn = firebase.database().ref("Phongngu");

  const ctx = document
    .getElementById("temperatureHumidityChart")
    .getContext("2d");
  const data = {
    labels: [],
    datasets: [
      {
        label: "Nhiệt độ (°C)",
        borderColor: "#ff4d4d",
        backgroundColor: "rgba(255, 77, 77, 0.2)",
        data: [],
        fill: true,
        tension: 0.4,
      },
      {
        label: "Độ ẩm (%)",
        borderColor: "#4a90e2",
        backgroundColor: "rgba(74, 144, 226, 0.2)",
        data: [],
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chart = new Chart(ctx, {
    type: "line",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            font: {
              size: 12,
              family: "'Poppins', sans-serif",
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Thời gian",
            font: {
              size: 12,
              family: "'Poppins', sans-serif",
            },
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Giá trị",
            font: {
              size: 12,
              family: "'Poppins', sans-serif",
            },
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
      },
      animation: {
        duration: 800,
        easing: "easeInOutQuad",
      },
    },
  });

  function updateChart(roomRef, tempKey, humiKey) {
    roomRef.on("value", function (snapshot) {
      const values = snapshot.val();
      if (values) {
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        if (data.labels.length >= 8) {
          data.labels.shift();
          data.datasets[0].data.shift();
          data.datasets[1].data.shift();
        }
        data.labels.push(timestamp);
        data.datasets[0].data.push(values[tempKey]);
        data.datasets[1].data.push(values[humiKey]);
        chart.update();
      }
    });
  }

  // Cập nhật dữ liệu Phòng họp
  window.function_ph = function () {
    dbRef_ph.child("nhietdo_ph").on("value", (snap) => {
      nhietdo.innerText = snap.val() + "°C";
    });
    dbRef_ph.child("doam_ph").on("value", (snap) => {
      doam.innerText = snap.val() + "%";
    });
    dbRef_ph.child("thanhvien_ph").on("value", (snap) => {
      thanhvien.innerHTML = snap.val() + ' <i class="fas fa-user"></i>';
    });
    updateChart(dbRef_ph, "nhietdo_ph", "doam_ph");
  };

  // Cập nhật dữ liệu Phòng làm việc
  window.function_plv = function () {
    dbRef_plv.child("nhietdo_plv").on("value", (snap) => {
      nhietdo.innerText = snap.val() + "°C";
    });
    dbRef_plv.child("doam_plv").on("value", (snap) => {
      doam.innerText = snap.val() + "%";
    });
    dbRef_plv.child("thanhvien_plv").on("value", (snap) => {
      thanhvien.innerHTML = snap.val() + ' <i class="fas fa-user"></i>';
    });
    updateChart(dbRef_plv, "nhietdo_plv", "doam_plv");
  };

  // Cập nhật dữ liệu Phòng ngủ
  window.function_pn = function () {
    dbRef_pn.child("nhietdo_pn").on("value", (snap) => {
      nhietdo.innerText = snap.val() + "°C";
    });
    dbRef_pn.child("doam_pn").on("value", (snap) => {
      doam.innerText = snap.val() + "%";
    });
    dbRef_pn.child("thanhvien_pn").on("value", (snap) => {
      thanhvien.innerHTML = snap.val() + ' <i class="fas fa-user"></i>';
    });
    updateChart(dbRef_pn, "nhietdo_pn", "doam_pn");
  };
});

// Đồng hồ số thời gian thực
function updateDigitalClock() {
  const timeElement = document.getElementById("time");
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateDigitalClock, 1000);
updateDigitalClock();

// Hàm hiển thị modal mã QR Zalo
function showZaloQR() {
  const modal = document.getElementById("zaloModal");
  modal.style.display = "flex";
}

// Hàm đóng modal mã QR Zalo
function closeZaloQR() {
  const modal = document.getElementById("zaloModal");
  modal.style.display = "none";
}
