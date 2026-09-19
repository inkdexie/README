let items = [];
let dataSource = '';
let current = 0;
let statChart = null;

const setStatus = (text, type) => {
  $('#load-status').text(text)
    .attr('class', 'alert alert-' + type + ' mb-3 text-center');
};

const renderHotbar = () => {
  $('#hotbar').empty();
  items.forEach((item, i) => {
    const slot = $('<button type="button" class="mw-slot"></button>')
      .attr('data-id', item.id)
      .attr('aria-label', '物品 ' + (i + 1) + '：' + item.name)
      .toggleClass('active', i === current);
    slot.append($('<span class="mw-icon"></span>').css('background', item.color));
    slot.append($('<span class="mw-slot-name"></span>').text((i + 1) + ' ' + item.name));
    $('#hotbar').append(slot);
  });
};

const selectItem = (i) => {
  if (i < 0 || i >= items.length) return;
  current = i;
  $('#hotbar .mw-slot').each(function () {
    $(this).toggleClass('active', $(this).index() === i);
  });
  $('#held-name').text(items[i].name);
};

const renderChart = (item) => {
  const labels = Object.keys(item.stats);
  const values = Object.values(item.stats);
  if (statChart !== null) {
    statChart.destroy();
  }
  statChart = new Chart(document.querySelector('#stat-chart'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '属性评分（分）',
        data: values,
        backgroundColor: item.color,
        borderColor: 'rgba(0,0,0,.4)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: item.name + ' 属性对比（单位：分，满分10）' }
      },
      scales: {
        y: { beginAtZero: true, max: 10, title: { display: true, text: '评分（分）' } }
      }
    }
  });
};

const showBoard = (item) => {
  $('#board-img').css('background', item.color);
  $('#board-name').text(item.name);
  $('#board-desc').text(item.desc);
  $('#board-index').text(items.indexOf(item) + 1);
  $('#board-source').text('数据来源：' + dataSource);
  $('#itemModal').modal('show');
  renderChart(item);
};

$(document).on('keydown', (e) => {
  if (items.length === 0) return;
  if ($('#itemModal').hasClass('show')) return;
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= items.length) {
    selectItem(n - 1);
  }
});

$('#hotbar').on('click', '.mw-slot', function () {
  const i = $(this).index();
  selectItem(i);
  showBoard(items[i]);
});

$('#hotbar').on('keydown', '.mw-slot', function (e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    $(this).trigger('click');
  }
});

const loadData = async () => {
  setStatus('加载中...', 'warning');
  try {
    const response = await fetch('data/items.json?t=' + Date.now());
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (!Array.isArray(data.items)) {
      setStatus('数据格式错误：items 字段不是数组', 'danger');
      return;
    }
    if (data.items.length === 0) {
      setStatus('暂无物品数据', 'warning');
      return;
    }
    items = data.items;
    dataSource = data.source || '未注明';
    $('#load-status').addClass('d-none');
    $('#hotbar-wrap').removeClass('d-none');
    renderHotbar();
    $('#held-name').text(items[0].name);
  } catch (error) {
    const msg = error instanceof SyntaxError ? '数据格式错误：JSON 无法解析' : error.message;
    setStatus('加载失败：' + msg, 'danger');
  }
};

loadData();
