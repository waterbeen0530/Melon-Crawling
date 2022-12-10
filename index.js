const axios = require("axios");
const cheerio = require("cheerio");

const getHTML = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.log(error);
  }
};

const getSongIdList = async ($) => {
  const table = $("table tbody");

  const songIdList = [];
  table.find("tr.lst50").each(async (_, elem) => {
    const songId = $(elem).attr("data-song-no");
    songIdList.push(songId);
  });

  return songIdList;
};

const getGenre = async (songId) => {
  const url = `https://www.melon.com/song/detail.htm?songId=${songId}`;
  const html = await getHTML(url);
  const $ = cheerio.load(html.data);

  const meta = $("div.entry > div.meta > dl.list > dd");
  return $(meta[2]).text();
};

const melonData = async () => {
  const html = await getHTML("https://www.melon.com/chart/month/index.htm");
  const $ = cheerio.load(html.data);
  const songIdList = await getSongIdList($);

  const genreList = [];

  for (songId of songIdList) {
    const a = await getGenre(songId);
    genreList.push(a);
  }
  console.log(genreList);
};

melonData();
