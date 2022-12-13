const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const data = require("./data/top3.json");

const getHTML = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.log(error);
  }
};

//음악 고유아이디 가져오기
const getSongIdList = async ($) => {
  const table = $("table tbody");

  const songIdList = [];
  table.find("tr.lst50").each(async (_, elem) => {
    const songId = $(elem).attr("data-song-no");
    songIdList.push(songId);
  });

  return songIdList;
};

let count = 0;

//음악 정보 가져오기
const getGenre = async (songId) => {
  const url = `https://www.melon.com/song/detail.htm?songId=${songId}`;
  const html = await getHTML(url);
  const $ = cheerio.load(html.data);

  const title = $("div.song_name").text().trim().slice(2).trim();
  const meta = $("div.entry > div.meta > dl.list > dd"); //???
  const genre = $(meta[2]).text().trim();
  const singer = $("div.artist > a.artist_name > span").text();

  return {
    title,
    genre,
    singer,
  };
};

//정보 배열로 받아오기

const month = 11; //???

const melonData = async () => {
  const html = await getHTML(
    `https://www.melon.com/chart/month/index.htm?classCd=GN0000&moved=Y&rankMonth=2021${month
      .toString()
      .padStart(2, "0")}` //???
  );
  const $ = cheerio.load(html.data);
  const songIdList = await getSongIdList($);

  const itemList = []; //???

  for (songId of songIdList.slice(0, 3)) {
    const a = await getGenre(songId);
    itemList.push(a);
  }
  return itemList;
};

const getJSON = async (itemList) => {
  let obj = data;

  obj[String(month)] = itemList;
  obj = JSON.stringify(obj);

  fs.writeFileSync("top3.json", obj, "utf-8");
};

(async () => {
  const itemList = await melonData();
  console.log(itemList);
  getJSON(itemList);
})();
