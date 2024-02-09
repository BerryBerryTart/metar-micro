import express from "express";
import convert from "xml-js";
const app = express();
const port = 4040;

app.get("/", (req, res) => {
  res.send("Test!");
});

app.get("/metar/:station", async (req, res) => {
  const station = req.params.station;
  let now = new Date();
  now = now.setHours(now.getHours() - 2);
  const t = now.valueOf() / 1000;

  // TEST URL https://aviationweather.gov/api/data/dataserver?requestType=retrieve&dataSource=metars&stationString=kpbi&startTime=1707459322
  const reqUrl = `https://aviationweather.gov/api/data/dataserver?requestType=retrieve&dataSource=metars&stationString=${station}&startTime=${t}`;

  const data = await fetch(reqUrl)
    .then((r) => r.text())
    .then((r) => convert.xml2json(r, { compact: true }))
    .then((r) => JSON.parse(r))
    .catch((err) => res.status(500).send(err));

  let metar = undefined;
  const metarObj = data?.response?.data?.METAR;
  if (metarObj && Array.isArray(metarObj) && metarObj.length > 0) {
    metar = metarObj[0]?.raw_text?._text;
  }

  if (metar) {
    res.send(metar);
  } else {
    res.status(404).send(`ERROR: NO METAR FOUND FOR ${station}`);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
