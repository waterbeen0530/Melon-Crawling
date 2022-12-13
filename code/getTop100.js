const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const data = require("./data/top100-2.json");

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
  table
    .find("tr")
    .slice(1, 101)
    .each(async (_, elem) => {
      const songId = $(elem).attr("data-song-no");
      songIdList.push(songId);
    });

  return songIdList;
};

let count = 0;

//음악 장르 가져오기
const getGenre = async (songId) => {
  const url = `https://www.melon.com/song/detail.htm?songId=${songId}`;
  const html = await getHTML(url);
  const $ = cheerio.load(html.data);

  const meta = $("div.entry > div.meta > dl.list > dd");
  const genre = $(meta[2])
    .text()
    .split(",")
    .map((s) => s.trim());

  console.log(`${++count}/100`);
  return genre;
};

//장르 배열로 받아오기

const month = 12;

let genreTable = {};

const saveGenre = (genres) => {
  genres.map((genre) => {
    if (genreTable[genre]) {
      genreTable[genre]++;
    } else {
      genreTable[genre] = 1;
    }
  });
};

const melonData = async () => {
  const html = await getHTML(
    `https://www.melon.com/chart/month/index.htm?classCd=GN0000&moved=Y&rankMonth=2021${month
      .toString()
      .padStart(2, "0")}`
  );
  const $ = cheerio.load(html.data);
  const songIdList = await getSongIdList($);

  for (songId of songIdList) {
    const genres = await getGenre(songId);
    console.log(genres);
    saveGenre(genres);
  }
};

const getSeason = () => {
  const season = ["spring", "summer", "autumn", "winter"];
  let a = Math.floor((month - 2) / 3);
  a = a < 0 ? 3 : a;

  return season[a];
};

const saveJSON = (genreList, season) => {
  let seasonData = data[season];

  Object.keys(genreList).forEach((genreKey) => {
    const value = genreList[genreKey];

    if (seasonData[genreKey]) {
      seasonData[genreKey] += value;
    } else {
      seasonData[genreKey] = value;
    }
  });

  return seasonData;
};

const getJSON = async (genreList) => {
  let obj = data;

  const season = getSeason();

  obj[season] = saveJSON(genreList, season);
  obj = JSON.stringify(obj);

  fs.writeFileSync("./data/top100-2.json", obj, "utf-8");
};

(async () => {
  await melonData();
  console.log(genreTable);
  getJSON(genreTable);
})();
