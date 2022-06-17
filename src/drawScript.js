
const urlForRequest = 'localhost:3001/index';
let dataArray = null;
axios.get(urlForRequest).then(
  function (res) {
    dataArray = JSON.parse(res.data);
  }
);

const options = {
  chart: {
    type: 'candlestick'
  },
  series: [ {
    name: 'line',
    type: 'line',
    data: [
      {
        x: 2010,
        y: 5
      },
      {
        x: 2020,
        y: 2
      },
      {
        x: 2030,
        y: 5
      }
    ]
  },
    {
      name: 'line',
      type: 'line',
      data: [
        {
          x: "2010",
          y: 7
        },
        {
          x: "2020",
          y: 8
        },
        {
          x: "2030",
          y: 9
        }
      ]
    },
    {
      name: 'candle',
      type: 'candlestick',
      data: dataArray // data: [ ...modelData() ]  data: [ 1, 2, 3 ]
    } ],
}

const chart = new ApexCharts(document.querySelector("#chart"), options);

chart.render();

console.log('step 2');