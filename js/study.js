const rooms = [
  { name: '101自习室', floor: '1楼', open: true, seats: 80, used: 65 },
  { name: '102自习室', floor: '1楼', open: false, seats: 60, used: 0 },
  { name: '201自习室', floor: '2楼', open: true, seats: 100, used: 88 },
  { name: '202自习室', floor: '2楼', open: true, seats: 72, used: 41 },
  { name: '203自习室', floor: '2楼', open: false, seats: 50, used: 0 },
  { name: '301自习室', floor: '3楼', open: true, seats: 90, used: 76 },
  { name: '302自习室', floor: '3楼', open: true, seats: 64, used: 23 },
  { name: '303自习室', floor: '3楼', open: false, seats: 48, used: 0 },
  { name: '305研讨间', floor: '3楼', open: true, seats: 20, used: 20 }
];

const state = { floor: '全部', open: '全部' };
const list = document.querySelector('#room-list');

const render = () => {
  list.innerHTML = '';
  const shown = rooms.filter(room => {
    const floorOk = state.floor === '全部' || room.floor === state.floor;
    const openOk = state.open === '全部'
      || (state.open === 'open' && room.open)
      || (state.open === 'closed' && !room.open);
    return floorOk && openOk;
  });
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'list-group-item text-muted';
    li.textContent = '没有符合条件的自习室';
    list.appendChild(li);
    return;
  }
  shown.forEach(room => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const info = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = room.name;
    const floor = document.createElement('span');
    floor.className = 'text-muted small ms-2';
    floor.textContent = room.floor;
    info.appendChild(name);
    info.appendChild(floor);

    const right = document.createElement('span');
    const badge = document.createElement('span');
    badge.className = 'badge me-3 ' + (room.open ? 'text-bg-success' : 'text-bg-secondary');
    badge.textContent = room.open ? '开放中' : '已关闭';
    const seats = document.createElement('span');
    seats.className = 'text-muted small';
    seats.textContent = room.open ? `座位 ${room.used}/${room.seats}` : `座位 0/${room.seats}`;
    right.appendChild(badge);
    right.appendChild(seats);

    li.appendChild(info);
    li.appendChild(right);
    list.appendChild(li);
  });
};

const markActive = (boxId, attr, value) => {
  document.querySelectorAll('#' + boxId + ' button').forEach(btn => {
    const active = btn.dataset[attr] === value;
    btn.classList.toggle('btn-primary', active);
    btn.classList.toggle('btn-outline-primary', !active);
  });
};

document.querySelector('#floor-filters').addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  state.floor = e.target.dataset.floor;
  markActive('floor-filters', 'floor', state.floor);
  render();
});

document.querySelector('#open-filters').addEventListener('click', e => {
  if (e.target.tagName !== 'BUTTON') return;
  state.open = e.target.dataset.open;
  markActive('open-filters', 'open', state.open);
  render();
});

render();
