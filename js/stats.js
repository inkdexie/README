let usageChart = null;

const setStatus = (text, type) => {
  $('#status').text(text).attr('class', 'alert alert-' + type);
};

const renderChart = (data) => {
  if (usageChart !== null) {
    usageChart.destroy();
  }
  usageChart = new Chart(document.querySelector('#usage-chart'), {
    type: 'bar',
    data: {
      labels: data.rooms.map(room => room.name),
      datasets: [{
        label: '本周使用量（' + data.unit + '）',
        data: data.rooms.map(room => room.visits),
        backgroundColor: 'rgba(47, 107, 143, .7)',
        borderColor: 'rgba(31, 58, 95, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: data.title + '（单位：' + data.unit + '）' }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: '使用量（' + data.unit + '）' } }
      }
    }
  });
};

const loadData = async () => {
  setStatus('加载中...', 'warning');
  try {
    const response = await fetch('data/data.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (!data.rooms || data.rooms.length === 0) {
      setStatus('暂无数据', 'warning');
      return;
    }
    $('#chart-title').text(data.title);
    $('#data-source').text('数据来源：' + data.source + ' · 单位：' + data.unit);
    $('#chart-section').removeClass('d-none');
    renderChart(data);
    $('#status').addClass('d-none');
  } catch (error) {
    $('#chart-section').addClass('d-none');
    setStatus('加载失败：' + error.message, 'danger');
  }
};

loadData();
