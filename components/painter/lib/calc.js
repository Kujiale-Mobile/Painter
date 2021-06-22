/* eslint-disable */
// 四则运算

!(function () {
  var calculate = function (s) {
    s = s.trim();
    const stack = new Array();
    let preSign = '+';
    let numStr = '';
    const n = s.length;
    for (let i = 0; i < n; ++i) {
      if (s[i] === '.' || (!isNaN(Number(s[i])) && s[i] !== ' ')) {
        numStr += s[i];
      } else if (s[i] === '(') {
        let isClose = 1;
        let j = i;
        while (isClose > 0) {
          j += 1;
          if (s[j] === '(') isClose += 1;
          if (s[j] === ')') isClose -= 1;
        }
        numStr = `${calculate(s.slice(i + 1, j))}`;
        i = j;
      }
      if ((isNaN(Number(s[i])) && s[i] !== '.') || i === n - 1) {
        let num = parseFloat(numStr);
        switch (preSign) {
          case '+':
            stack.push(num);
            break;
          case '-':
            stack.push(-num);
            break;
          case '*':
            stack.push(stack.pop() * num);
            break;
          case '/':
            stack.push(stack.pop() / num);
            break;
          default:
            break;
        }
        preSign = s[i];
        numStr = '';
      }
    }
    let ans = 0;
    while (stack.length) {
      ans += stack.pop();
    }
    return ans;
  };
  module.exports = calculate;
})();
