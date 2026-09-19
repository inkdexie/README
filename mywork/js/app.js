const items = [
  {
    id: 'tnt',
    name: 'TNT',
    color: '#c0392b',
    desc: '一种红色爆炸方块，用火源或红石信号点燃后会延时爆炸，可用于采矿或清理大片方块。靠近未爆炸的 TNT 有危险，注意保持距离。'
  },
  {
    id: 'sword',
    name: '钻石剑',
    color: '#4aedd9',
    desc: '用钻石合成的近战武器，攻击力高且耐用，是生存前期到后期都十分可靠的装备。手持时还能格挡部分伤害。'
  },
  {
    id: 'torch',
    name: '火把',
    color: '#ffb52e',
    desc: '用木棍和煤炭合成的照明物品，插在墙面或地面上发出光亮，能防止黑暗处生成怪物，是矿洞探索的必备品。'
  },
  {
    id: 'apple',
    name: '金苹果',
    color: '#f2c14e',
    desc: '用金锭包裹苹果合成的珍贵食物，食用后恢复饥饿值并获得生命恢复等增益效果，材料稀有，建议关键时刻再用。'
  }
];

let current = 0;

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

const showBoard = (item) => {
  $('#board-img').css('background', item.color);
  $('#board-name').text(item.name);
  $('#board-desc').text(item.desc);
  $('#board-index').text(items.indexOf(item) + 1);
  $('#itemModal').modal('show');
};

$(document).on('keydown', (e) => {
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

renderHotbar();
$('#held-name').text(items[0].name);
