/**
 * 2~4 : 봄
 * 5~7 : 여름
 * 8~10: 가을
 * 11~13: 겨울
 */

// 0 - 2;
// 3 - 5;
// 6 - 8;
// 9 - 11;

const f = (m) => {
  let a = Math.floor((m - 2) / 3);
  a = a < 0 ? 3 : a;

  console.log(`m : ${m} | a : ${a}`);
};

for (let i = 1; i <= 12; i++) {
  f(i);
}
