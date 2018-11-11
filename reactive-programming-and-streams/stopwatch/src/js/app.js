import { Observable } from 'rxjs/rx';
import { Subject } from 'rxjs/rx';

window.onload = function () {
  initialize();
}

const initialize = function () {
  var canvas = document.getElementById("stopwatch");
  var ctx = canvas.getContext("2d");
  var radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius = radius * 0.90

  stopwatch.ctx = ctx;
  stopwatch.radius = radius;
  stopwatch.canvas = canvas;
  stopwatch.ctx = ctx;
  stopwatch.drawClock();

  addStreams();
}

const addStreams = () => {
  var buttonStreams = Observable.merge(
    Observable.fromEvent(document.getElementById('start'), 'click').mapTo(stopwatch.start),
    Observable.fromEvent(document.getElementById('stop'), 'click').mapTo(stopwatch.stop),
    Observable.fromEvent(document.getElementById('split'), 'click').mapTo(stopwatch.split),
    Observable.fromEvent(document.getElementById('reset'), 'click').mapTo(stopwatch.reset)
  )
  buttonStreams
    .scan((accum, curr) => curr.apply(stopwatch, accum), {})
    .subscribe();
}



var Timer = {
  time: Date,
  subscription: {},
  stopped : false,
  started: false,
  start: function (interval, cb) {
    if (this.stopped) {
      return;
    } else {
      this.started = true;
      this.time = new Date();
      this.time.setSeconds(0);
      this.time.setMinutes(0);
      this.time.setHours(0);

      this.timeSource = Observable
      .interval(interval)
      .timeInterval()
      .subscribe((total) => {
        if (this.stopped) { 
          return;
        }
        this.time.setMilliseconds(this.time.getMilliseconds() + 100);
        cb(this.time);
      });
    }   
  },

  resume: function() {
    this.stopped = false;
  },
  stop: function () {
    this.stopped = true;
  },
  reset: function () {
    this.stopped = false;
    this.started = false;
    this.timeSource.unsubscribe();
  }
}



const stopwatch = {
  ctx: {},
  radius: 0,
  canvas: {},
  context: {},
  started: false,
  stopped: false,
  isReset: false,
  splits: [],
  start: function () {
    if (this.started && this.stopped && !this.isReset) { 
      this.timer.resume();
    } else if (this.started && !this.isReset) { 
      return;
    } else { 
      this.started = true;
      this.stopped = false;
      this.isReset = false;
      this.timer = Object.create(Timer);
      var digital = document.getElementById('digital');
      this.timer.start(100,
        time => {
          digital.innerHTML = this.humanReadableTime(time);
          this.drawClock(time);
        });
    }
  },

  stop: function () {
    this.stopped = true;
    this.timer.stop();
  },

  reset: function () {
    if (!this.stopped) {
      return;
    }
    this.splits = [];
    const splitContainer = document.getElementById("split-container");
    const rows = splitContainer.getElementsByClassName("rows")[0];
    while (rows.firstChild) {
      rows.removeChild(rows.firstChild);
    }
    this.drawClock();
    var digital = document.getElementById('digital');
    digital.innerHTML = "00:00:0";
    this.isReset = true;
    this.timer.reset();
  },

  split: function () {
    const splitTime = this.humanReadableTime(this.timer.time);
    this.splits.push(splitTime);
    const splitContainer = document.getElementById("split-container");
    const rows = splitContainer.getElementsByClassName("rows")[0];

    if (this.splits.length == 1) {
      var topRow = document.createElement("div");
      topRow.className = "split-row top";
      topRow.innerHTML = splitTime;
      rows.appendChild(topRow);
    } else {
      var row = document.createElement("div");
      row.className = "split-row";
      row.innerHTML = splitTime;
      rows.appendChild(row);
    }
  },

  drawClock: function (time = null) {
    this.drawFace();
    this.drawTicks();
    this.drawTime(time);
  },

  humanReadableTime: function (time) {
    return time.toISOString().slice(14, 21);
  },

  drawFace: function () {
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'white';
    this.ctx.fill();
    this.ctx.lineWidth = this.radius * 0.03;
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius * 0.05, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#333';
    this.ctx.fill();
  },

  drawTicks: function () {
    var ang;
    var num;
    this.ctx.textAlign = "center";
    for (var i = 0; i < 12; i++) {
      this.ctx.beginPath();
      this.ctx.rotate(Math.PI / 6);
      this.ctx.moveTo(90, 0);
      this.ctx.lineTo(80, 0);
      this.ctx.stroke();
    }
    this.ctx.lineWidth = this.radius * 0.01;
    for (i = 0; i < 60; i++) {
      if (i % 5 != 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(85, 0);
        this.ctx.lineTo(80, 0);
        this.ctx.stroke();
      }
      this.ctx.rotate(Math.PI / 30);
    }
  },

  drawTime: function (time = null) {
    var hour = 0;
    var minute = 0;
    var second = 0;

    if (time !== null) {
      hour = time.getHours();
      minute = time.getMinutes();
      second = time.getSeconds();
    }


    hour = hour % 12;
    hour = (hour * Math.PI / 6) +
      (minute * Math.PI / (6 * 60)) +
      (second * Math.PI / (360 * 60));
    this.drawHand(this.ctx, hour, this.radius * 0.3, this.radius * 0.07);
 
    minute = ((minute * Math.PI) / 30) + ((second * Math.PI) / (30 * 60));
    this.drawHand(this.ctx, minute, this.radius * 0.8, this.radius * 0.07);

    second = (second * Math.PI / 30);
    this.drawHand(this.ctx, second, this.radius * 0.9, this.radius * 0.02);
  },

  drawHand: function (ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
  }
}