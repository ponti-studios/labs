var prizes = ['A Unicorn!', 'A Hug!', 'Fresh Laundry!']

for (var btnNum = 0; btnNum < prizes.length; btnNum++) {
  // for each of our buttons, when the user clicks it...
  document.getElementById('btn-' + btnNum).onclick = (function (n) {
    // tell her what she's won!
    return function () { alert(prizes[n]) }
  }(btnNum))
}
